import { Request, Response } from "express";
import { generateNFTsService } from "../services/generate"; // Sesuaikan path
import path from "path";

export async function generateNFTs(req: Request, res: Response) {
  try {
    const { collection, description, total, targetResolution, targetFPS } =
      req.body;

    if (
      !collection ||
      !description ||
      typeof total !== "number" ||
      total <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Missing or invalid generation parameters." });
    }

    const result = await generateNFTsService({
      collectionName: collection,
      description,
      total,
      targetResolution,
      targetFPS,
    });

    res.status(200).json({
      message: "NFT generation process started successfully.",
      collectionId: result.collectionId,
      totalCreated: result.totalCreated,
      logs: result.logs,
      nfts: result.nfts,
      combinedMetadataPath: result.combinedMetadataPath,
      previewImagePath: result.previewImagePath
        ? path.basename(result.previewImagePath)
        : null,
    });
  } catch (error: any) {
    console.error("Error during NFT generation:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate NFTs." });
  }
}
