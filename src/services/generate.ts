import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import crypto from "crypto";
import os from "os";

// Import Prisma Client
import { PrismaClient, Collections, Nfts } from "@prisma/client"; // Impor tipe Collection dan Nft
const prisma = new PrismaClient(); // Inisialisasi Prisma Client

// Import fungsi utilitas FFmpeg
import { combineVideosFromAnyFolder } from "../utils/ffmpeg"; // Sesuaikan path jika struktur folder Anda berbeda

// Asumsi: Antarmuka ini didefinisikan di '../types/generate'
import {
  GeneratedNFTDetail,
  GenerateNFTsParams,
  NftGenerationServiceResponse,
} from "../types/generate";

const XLS24D_ART_V0_SCHEMA_URL =
  "ipfs://QmNpi8rcXEkohca8iXu7zysKKSJYqCvBJn3xJwga8jXqWU";
const NFT_TYPE = "art.v0";
const COLLECTION_FAMILY_NAME = "Your NFT Collection Family";

export async function generateNFTsService({
  total,
  collectionName,
  description,
  targetResolution,
  targetFPS,
}: GenerateNFTsParams): Promise<NftGenerationServiceResponse> {
  const logs: string[] = [];
  let collectionRecord: Collections | null = null;
  let created = 0;
  let attempt = 0;

  try {
    // --- Validasi Input Awal ---
    if (isNaN(total) || total <= 0 || total > 5000) {
      throw new Error("Total kombinasi harus antara 1 sampai 5000.");
    }
    if (!collectionName.trim()) {
      throw new Error("Nama koleksi harus diisi.");
    }
    if (!description.trim()) {
      throw new Error("Deskripsi harus diisi.");
    }

    logs.push(`Memulai proses generasi untuk koleksi: ${collectionName}`);
    logs.push(`Jumlah total NFT yang diminta: ${total}`);

    // --- 1. Temukan atau Buat Koleksi di Database ---
    try {
      collectionRecord = await prisma.collections.upsert({
        where: { name: collectionName },
        update: {
          description: description,
          updatedAt: new Date(),
        },
        create: {
          name: collectionName,
          description: description,
          totalMinted: 0,
        },
      });
      logs.push(
        `✅ Koleksi '${collectionRecord.name}' (ID: ${collectionRecord.id}) ${
          collectionRecord.createdAt.getTime() ===
          collectionRecord.updatedAt.getTime()
            ? "dibuat"
            : "ditemukan"
        } di database.`
      );
    } catch (dbErr: any) {
      throw new Error(
        `Gagal mengakses atau membuat koleksi di database: ${dbErr.message}`
      );
    }

    const generatedNftsDetails: GeneratedNFTDetail[] = [];

    // --- Konfigurasi Path File Sistem ---
    const baseDir = path.join(process.cwd(), "public/layers");
    const outputBaseDir = path.join(
      process.cwd(),
      "public/output",
      collectionName
    );
    const outputVideoDir = path.join(outputBaseDir, "video");
    const outputJsonDir = path.join(outputBaseDir, "metadata");

    const previewLocalPath = path.join(outputBaseDir, "preview.gif");
    let previewImagePath: string | null = null; // Mengubah nama variabel

    const videoExtensions = [".mov", ".gif", ".webm", ".m4v", ".mp4"];

    await fs.mkdir(outputVideoDir, { recursive: true });
    await fs.mkdir(outputJsonDir, { recursive: true });
    logs.push(`Direktori output dibuat di: ${outputBaseDir}`);

    // --- Memuat Kategori Layer yang Tersedia ---
    const folders = await fs.readdir(baseDir, { withFileTypes: true });
    const availableCategories = folders
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    if (availableCategories.length < 2) {
      throw new Error("Minimal 2 kategori video diperlukan di /layers.");
    }
    logs.push(`Kategori yang tersedia: ${availableCategories.join(", ")}`);

    const usedCombinations = new Set<string>();
    const maxAttempts = total * 50;

    // --- Loop Generasi NFT ---
    while (created < total && attempt < maxAttempts) {
      attempt++;
      logs.push(`\n--- Percobaan Kombinasi #${attempt} ---`);

      const videoPaths: string[] = [];
      const usedFilesRelative: string[] = [];
      const attributes: {
        trait_type: string;
        value: string;
        description?: string;
      }[] = [];

      let skipCombination = false;
      // --- Pilih Layer untuk Kombinasi ---
      for (const category of availableCategories) {
        const dir = path.join(baseDir, category);
        try {
          const files = await fs.readdir(dir);
          const validFiles = files.filter((f) =>
            videoExtensions.includes(path.extname(f).toLowerCase())
          );

          if (validFiles.length === 0) {
            logs.push(
              `⚠️ Peringatan: Tidak ada file video valid di folder '${category}'. Melewati kategori ini.`
            );
            continue;
          }

          const selectedFile =
            validFiles[Math.floor(Math.random() * validFiles.length)];
          const fullPath = path.join(dir, selectedFile);
          videoPaths.push(fullPath);
          usedFilesRelative.push(`/layers/${category}/${selectedFile}`);
          attributes.push({
            trait_type: category,
            value: path.basename(selectedFile, path.extname(selectedFile)),
            description: `A ${category} trait.`,
          });
        } catch (err: any) {
          logs.push(
            `❌ Gagal membaca folder '${category}': ${err.message}. Melewati kombinasi ini.`
          );
          skipCombination = true;
          break;
        }
      }

      if (skipCombination || videoPaths.length < 2) {
        logs.push(
          "⛔️ Kombinasi gagal dibuat (layer kurang dari 2 atau ada kesalahan pembacaan folder)."
        );
        continue;
      }

      // --- Periksa Duplikasi Kombinasi ---
      const combinationHash = crypto
        .createHash("sha256")
        .update(usedFilesRelative.sort().join("|"))
        .digest("hex");

      if (usedCombinations.has(combinationHash)) {
        logs.push("⚠️ Kombinasi duplikat, mencoba ulang...");
        continue;
      }

      usedCombinations.add(combinationHash);
      created++; // 'created' di sini digunakan dan diperbarui

      const numberLabel = `#${created}`;
      const baseFilename = `${collectionName} ${numberLabel}`;
      const videoFilename = `${collectionName}-${created}.gif`;
      const jsonFilename = `${collectionName}-${created}.json`;

      const videoOutPath = path.join(outputVideoDir, videoFilename);
      const jsonOutPath = path.join(outputJsonDir, jsonFilename);

      logs.push(`🎬 Membuat video ${numberLabel}`);
      videoPaths.forEach((v, idx) => {
        logs.push(`   🔹 Layer ${idx + 1}: ${path.basename(v)}`);
      });

      let tempJsonPathForMetadata: string | undefined; // Mengubah nama variabel
      let createdNftRecord: Nfts | null = null; // Tipe yang lebih spesifik

      try {
        // --- Gabungkan Video ---
        await combineVideosFromAnyFolder(
          videoPaths,
          videoOutPath,
          targetResolution,
          targetFPS
        );
        logs.push(
          `✅ Video berhasil dibuat: ${path.relative(
            process.cwd(),
            videoOutPath
          )}`
        );

        // --- Buat Preview Koleksi (hanya untuk NFT pertama) ---
        if (created === 1) {
          try {
            await fs.copyFile(videoOutPath, previewLocalPath);
            previewImagePath = path.relative(process.cwd(), previewLocalPath); // Simpan path lokal
            if (collectionRecord) {
              await prisma.collections.update({
                where: { id: collectionRecord.id },
                data: {
                  previewImageUrl: path.basename(previewImagePath || ""),
                },
              });
            }
            logs.push(
              `📸 Preview koleksi disimpan secara lokal: /${previewImagePath}`
            );
          } catch (err: any) {
            logs.push(
              `❌ Gagal menyimpan preview koleksi secara lokal: ${err.message}`
            );
          }
        }

        const fileName = path.basename(videoOutPath);

        // --- Buat Metadata NFT (lokal) ---
        const nftMetadata = {
          schema: XLS24D_ART_V0_SCHEMA_URL,
          nftType: NFT_TYPE,
          name: baseFilename,
          description: description,
          image: fileName,
          animation: fileName,
          video: fileName,
          collection: {
            name: collectionName,
            family: COLLECTION_FAMILY_NAME,
          },
          attributes: attributes,
          compiler: "owlskull",
        };

        tempJsonPathForMetadata = path.join(
          os.tmpdir(),
          `xls24d_temp_metadata_${jsonFilename}`
        );
        await fs.writeFile(
          tempJsonPathForMetadata,
          JSON.stringify(nftMetadata, null, 2)
        );
        logs.push(
          `📄 Metadata NFT sementara dibuat: ${tempJsonPathForMetadata}`
        );

        // Hitung hash dari konten metadata lokal
        const metadataContentHash = crypto
          .createHash("sha256")
          .update(JSON.stringify(nftMetadata))
          .digest("hex");

        // --- Simpan Data NFT ke Database ---
        if (collectionRecord) {
          createdNftRecord = await prisma.nfts.create({
            data: {
              name: baseFilename,
              description: description,
              imageIpfsUrl: path.basename(videoOutPath),
              animationIpfsUrl: path.basename(videoOutPath),
              metadataIpfsUrl: path.basename(jsonOutPath),
              metadataHash: metadataContentHash, // Hash dari konten metadata lokal
              localVideoPath: path.relative(process.cwd(), videoOutPath),
              attributes: attributes as any, // Perlu cast ke 'any' karena Prisma Json type
              collectionId: collectionRecord.id,
            },
          });
          logs.push(
            `✅ NFT '${createdNftRecord.name}' (ID: ${createdNftRecord.id}) berhasil disimpan ke database.`
          );

          generatedNftsDetails.push({
            id: createdNftRecord.id,
            name: createdNftRecord.name,
            imagePath: createdNftRecord.imageIpfsUrl, // Menggunakan path lokal
            metadataPath: createdNftRecord.metadataIpfsUrl, // Menggunakan path lokal
            metadataHash: createdNftRecord.metadataHash,
          });

          // Simpan metadata ke file output final
          await fs.writeFile(jsonOutPath, JSON.stringify(nftMetadata, null, 2));
          logs.push(`✅ Metadata NFT disimpan secara lokal: ${jsonOutPath}`);
        } else {
          logs.push(
            `❌ Kesalahan: collectionRecord null. Tidak dapat membuat NFT di database.`
          );
          created--; // Kurangi jumlah yang dibuat jika tidak dapat disimpan
        }
      } catch (err: any) {
        logs.push(
          `❌ Gagal dalam langkah pembuatan/penyimpanan lokal/DB untuk NFT ${numberLabel}: ${err.message}`
        );
        created--; // Kurangi jumlah yang dibuat jika terjadi kesalahan
        // --- Penanganan Rollback Kesalahan ---
        try {
          if (existsSync(videoOutPath)) await fs.unlink(videoOutPath);
          if (existsSync(jsonOutPath)) await fs.unlink(jsonOutPath); // Hapus file metadata lokal jika gagal
          if (createdNftRecord) {
            await prisma.nfts.delete({ where: { id: createdNftRecord.id } });
            logs.push(
              `🗑️ Record NFT untuk '${numberLabel}' dihapus dari database.`
            );
          }
          logs.push(`🗑️ File lokal untuk NFT '${numberLabel}' dihapus.`);
        } catch (unlinkErr: any) {
          logs.push(
            `⚠️ Gagal menghapus file lokal atau record NFT: ${unlinkErr.message}`
          );
        }
        continue; // Lanjutkan ke percobaan kombinasi berikutnya
      } finally {
        // Bersihkan file metadata sementara
        if (tempJsonPathForMetadata && existsSync(tempJsonPathForMetadata)) {
          await fs
            .unlink(tempJsonPathForMetadata)
            .catch((e) =>
              logs.push(
                `⚠️ Gagal menghapus file metadata sementara: ${tempJsonPathForMetadata}: ${e.message}`
              )
            );
        }
      }
    }

    // --- Perbarui Koleksi dengan Metadata Gabungan (lokal) ---
    let combinedMetadataPath: string | null = null; // Mengubah nama variabel
    let combinedMetadataTempPath: string | undefined;

    if (created > 0 && collectionRecord) {
      logs.push("\n--- Membuat Metadata Gabungan Koleksi (lokal) ---");
      try {
        const allIndividualNfts = await prisma.nfts.findMany({
          where: { collectionId: collectionRecord.id },
          select: {
            name: true,
            description: true,
            imageIpfsUrl: true, // Ini sekarang adalah path lokal
            animationIpfsUrl: true, // Ini sekarang adalah path lokal
            metadataIpfsUrl: true, // Ini sekarang adalah path lokal
            attributes: true,
          },
        });

        const allIndividualMetadataForCombined = allIndividualNfts.map(
          (nft) => ({
            name: nft.name,
            description: nft.description,
            image: path.basename(nft.imageIpfsUrl),
            animation: path.basename(nft.animationIpfsUrl || ""),
            metadata: path.basename(nft.metadataIpfsUrl),

            attributes: nft.attributes,
          })
        );

        const combinedCollectionMetadata = {
          name: collectionName,
          description: `Koleksi NFT ${collectionName}`,
          collection: allIndividualMetadataForCombined,
        };

        const combinedJsonFilename = `${collectionName}-collection-metadata.json`;
        combinedMetadataTempPath = path.join(
          outputBaseDir,
          combinedJsonFilename
        ); // Simpan langsung ke outputBaseDir
        await fs.writeFile(
          combinedMetadataTempPath,
          JSON.stringify(combinedCollectionMetadata, null, 2)
        );
        logs.push(
          `📄 Metadata gabungan koleksi dibuat secara lokal: ${combinedMetadataTempPath}`
        );

        combinedMetadataPath = `/${path.relative(
          process.cwd(),
          combinedMetadataTempPath
        )}`; // Path relatif dari public

        await prisma.collections.update({
          where: { id: collectionRecord.id },
          data: {
            combinedMetadataIpfsUrl: combinedMetadataPath, // Simpan path lokal
            totalMinted: created,
          },
        });
        logs.push(
          `✅ Koleksi di database diperbarui dengan metadata gabungan lokal dan total yang dicetak.`
        );
      } catch (err: any) {
        logs.push(
          `❌ Gagal membuat metadata gabungan lokal atau memperbarui koleksi: ${err.message}`
        );
        combinedMetadataPath = null;
      } finally {
        // Tidak perlu menghapus combinedMetadataTempPath karena sudah disimpan di folder output
      }
    } else if (collectionRecord) {
      // Jika tidak ada NFT yang dibuat, perbarui totalMinted menjadi 0
      await prisma.collections.update({
        where: { id: collectionRecord.id },
        data: { totalMinted: 0 },
      });
    }

    // --- Ringkasan Akhir ---
    logs.push(
      `🎉 Proses selesai. Berhasil membuat dan menyimpan ${created} NFT secara lokal.`
    );
    logs.push(`Total percobaan dilakukan: ${attempt}`);
    if (created < total) {
      logs.push(
        `Peringatan: Hanya ${created} dari ${total} NFT yang berhasil dibuat. Mungkin karena kombinasi duplikat atau kesalahan.`
      );
    }

    return {
      message: "Proses berhasil",
      logs,
      collectionId: collectionRecord ? collectionRecord.id : "N/A", // Pastikan ID tersedia
      totalCreated: created,
      nfts: generatedNftsDetails,
      combinedMetadataPath: combinedMetadataPath, // Menggunakan path lokal
      previewImagePath: previewImagePath, // Menggunakan path lokal
    };
  } catch (err: any) {
    const errorMessage = `Kesalahan Fatal di NftGenerationService: ${
      err.message || "Kesalahan tidak diketahui"
    }`;
    console.error("❌ Kesalahan Layanan Generasi NFT:", err);
    logs.push(errorMessage);

    // --- Penanganan Rollback Koleksi Kosong ---
    if (collectionRecord && created === 0) {
      try {
        await prisma.collections.delete({ where: { id: collectionRecord.id } });
        logs.push(
          `🗑️ Koleksi kosong ('${collectionRecord.name}') dihapus dari database karena proses gagal total.`
        );
      } catch (dbErr: any) {
        logs.push(`⚠️ Gagal menghapus koleksi kosong: ${dbErr.message}`);
      }
    }
    throw new Error(errorMessage); // Lempar kembali kesalahan agar ditangkap oleh controller
  } finally {
    // Penting: Putuskan koneksi Prisma di akhir layanan
    await prisma.$disconnect();
  }
}
