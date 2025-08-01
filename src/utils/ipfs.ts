// src/utils/ipfs.ts

import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import crypto from "crypto";
import mime from "mime-types";
import axios from "axios";
import FormData from "form-data";
import os from "os";

const PINATA_JWT = process.env.PINATA_JWT!;

export async function uploadFileOrDirectoryToPinata(
  inputPath: string,
  options?: {
    isDir?: boolean;
    wrapWithDirectory?: boolean;
    fileNameInCid?: string;
  }
): Promise<string> {
  const {
    isDir = false,
    wrapWithDirectory = false,
    fileNameInCid,
  } = options || {};
  const form = new FormData();
  const endpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  let ipfsHash: string;

  if (!PINATA_JWT) {
    throw new Error("Pinata JWT tidak dikonfigurasi. Tidak dapat mengunggah ke IPFS.");
  }

  try {
    if (isDir) {
      throw new Error(
        "Pengunggahan direktori langsung tidak diimplementasikan dalam helper ini untuk perilaku path-in-CID."
      );
    } else {
      if (wrapWithDirectory) {
        // Buat direktori sementara untuk membungkus file
        const tempDir = path.join(
          os.tmpdir(),
          crypto.randomBytes(16).toString("hex")
        );
        await fs.mkdir(tempDir, { recursive: true });
        const targetFileName = fileNameInCid || path.basename(inputPath);
        const tempFilePath = path.join(tempDir, targetFileName);
        await fs.copyFile(inputPath, tempFilePath);

        form.append("file", createReadStream(tempFilePath), {
          filename: targetFileName,
          contentType: mime.lookup(inputPath) || "application/octet-stream",
        });

        form.append(
          "pinataOptions",
          JSON.stringify({
            cidVersion: 1,
            wrapWithDirectory: true,
          })
        );
        form.append(
          "pinataMetadata",
          JSON.stringify({
            name: targetFileName,
          })
        );

        const response = await axios.post(endpoint, form, {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
        });

        ipfsHash = `${response.data.IpfsHash}/${targetFileName}`;
        await fs.rm(tempDir, { recursive: true, force: true }); // Bersihkan direktori sementara
      } else {
        // Unggah file tunggal tanpa pembungkus direktori
        form.append("file", createReadStream(inputPath), {
          filename: path.basename(inputPath),
          contentType: mime.lookup(inputPath) || "application/octet-stream",
        });

        const response = await axios.post(endpoint, form, {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            ...form.getHeaders(),
          },
          maxBodyLength: Infinity,
        });
        ipfsHash = response.data.IpfsHash;
      }
    }

    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message;
    console.error(
      `Kesalahan saat mengunggah file ${inputPath} ke Pinata:`,
      errorMessage
    );
    throw new Error(`Gagal mengunggah file ke Pinata: ${errorMessage}`);
  }
}

/**
 * Mengonversi URI IPFS (ipfs://CID/path) ke URL HTTP gateway.
 * @param ipfsUri URI IPFS.
 * @returns URL HTTP gateway.
 */
export function getIpfsHttpUrl(ipfsUri: string): string {
  if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) {
    // Jika bukan URI IPFS, kembalikan apa adanya atau tangani sebagai kesalahan
    console.warn(`Peringatan: Input bukan URI IPFS yang valid: ${ipfsUri}`);
    return ipfsUri; // Atau throw new Error('Invalid IPFS URI');
  }
  const cid = ipfsUri.replace("ipfs://", "");
  const DEFAULT_IPFS_GATEWAY =
    process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/"; // Fallback ke gateway umum
  return `${DEFAULT_IPFS_GATEWAY}${cid}`;
}
