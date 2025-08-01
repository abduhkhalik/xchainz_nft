// src/controllers/nftController.ts
import { Request, Response } from "express";
import { generateNFTsService } from "../services/generate";
import { NftService } from "../services/nfts";

export const NftController = {
  // === A. GENERATE NFT SECARA OTOMATIS ===
  async generateNFTs(req: Request, res: Response) {
    const { total, collection, description, targetResolution, targetFPS } =
      req.body;

    try {
      const response = await generateNFTsService({
        total: Number(total),
        collectionName: String(collection).trim(),
        description: String(description).trim(),
        targetResolution,
        targetFPS,
      });

      res.status(200).json(response);
    } catch (error: any) {
      console.error("Error in NFT generation controller:", error);
      const logs = error.logs && Array.isArray(error.logs) ? error.logs : [];
      logs.push(`API Error: ${error.message}`);

      const isClientError =
        error.message.includes("Total kombinasi harus") ||
        error.message.includes("Nama koleksi harus") ||
        error.message.includes("Deskripsi harus") ||
        error.message.includes("Minimal 2 kategori video diperlukan") ||
        error.message.includes("Pinata JWT is not configured");

      res.status(isClientError ? 400 : 500).json({
        error: error.message || "Gagal membuat NFT",
        details: error.message,
        logs,
      });
    }
  },

  // === B. GET SEMUA NFT (FILTER OPSIONAL: collectionId) ===
  async getAllNfts(req: Request, res: Response) {
    try {
      const { collectionId } = req.query;
      const nfts = await NftService.getAllNfts(collectionId as string);
      res.status(200).json(nfts);
    } catch (error: any) {
      console.error("Error fetching NFTs:", error.message);
      res.status(500).json({ error: "Failed to fetch NFTs" });
    }
  },

  // === C. GET NFT BERDASARKAN ID ===
  async getNftById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nft = await NftService.getNftById(id);
      if (!nft) {
        return res.status(404).json({ error: "NFT not found" });
      }
      res.status(200).json(nft);
    } catch (error: any) {
      console.error("Error fetching NFT by ID:", error.message);
      res.status(500).json({ error: "Failed to fetch NFT" });
    }
  },

  // === D. CREATE NFT MANUAL (BUKAN UNTUK GENERATE OTOMATIS) ===
  async createNft(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        imageIpfsUrl,
        metadataIpfsUrl,
        metadataHash,
        attributes,
        collectionId,
        animationIpfsUrl,
        localVideoPath,
      } = req.body;

      if (
        !name ||
        !description ||
        !imageIpfsUrl ||
        !metadataIpfsUrl ||
        !metadataHash ||
        !attributes ||
        !collectionId
      ) {
        return res
          .status(400)
          .json({ error: "Missing required fields for NFT creation" });
      }

      const newNft = await NftService.createNft({
        name,
        description,
        imageIpfsUrl,
        metadataIpfsUrl,
        metadataHash,
        attributes,
        collectionId,
        animationIpfsUrl,
        localVideoPath,
      });

      res.status(201).json(newNft);
    } catch (error: any) {
      console.error("Error creating NFT:", error.message);
      res.status(400).json({ error: error.message || "Failed to create NFT" });
    }
  },

  // === E. UPDATE NFT BERDASARKAN ID ===
  async updateNft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        imageIpfsUrl,
        metadataIpfsUrl,
        metadataHash,
        attributes,
        collectionId,
        animationIpfsUrl,
        localVideoPath,
      } = req.body;

      const updatedNft = await NftService.updateNft(id, {
        name,
        description,
        imageIpfsUrl,
        metadataIpfsUrl,
        metadataHash,
        attributes,
        collectionId,
        animationIpfsUrl,
        localVideoPath,
      });

      res.status(200).json(updatedNft);
    } catch (error: any) {
      console.error("Error updating NFT:", error.message);
      res.status(400).json({ error: error.message || "Failed to update NFT" });
    }
  },

  // === F. DELETE NFT BERDASARKAN ID ===
  async deleteNft(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await NftService.deleteNft(id);
      res.status(204).send(); // No Content
    } catch (error: any) {
      console.error("Error deleting NFT:", error.message);
      res.status(400).json({ error: error.message || "Failed to delete NFT" });
    }
  },

  // === G. GET NFT PREVIEW GIF BERDASARKAN NAMA ===
  async getNftPreviewByName(req: Request, res: Response) {
    try {
      const { collectionName, nftName } = req.params;

      // Cek koleksi
      const collection = await NftService.findCollectionByName(collectionName);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      // Cek NFT
      const nft = await NftService.findNftByNameInCollection(
        nftName,
        collection.id
      );
      if (!nft) {
        return res.status(404).json({ error: "NFT not found in collection" });
      }

      const path = require("path");
      const fs = require("fs");

      const gifFileName = `${nft.imageIpfsUrl}.gif`;

      const gifPath = path.join(
        process.cwd(),
        "public",
        "output",
        collection.name,
        "video",
        gifFileName
      );

      if (fs.existsSync(gifPath)) {
        return res.sendFile(gifPath);
      }

      const fallbackPath = path.join(
        process.cwd(),
        "public",
        "fallback",
        "preview-missing.gif"
      );

      if (fs.existsSync(fallbackPath)) {
        return res.sendFile(fallbackPath);
      }

      console.warn(
        "[getNftPreviewByName] Preview & fallback missing:",
        gifPath
      );
      return res.status(404).json({ message: "Preview not found" });
    } catch (error: any) {
      console.error("[getNftPreviewByName] Internal Error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
