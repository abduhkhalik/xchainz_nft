// src/routes/nftRoutes.ts
import { Router } from "express";
import { NftController } from "../controllers/nftControllers";

const router = Router();

// --- Rute CRUD untuk NFT Individual ---
router.get("/", NftController.getAllNfts); // Bisa pakai query param ?collectionId=...
router.get("/:id", NftController.getNftById);
router.post("/", NftController.createNft); // CATATAN: Ini untuk menambahkan NFT secara manual/existing, BUKAN untuk GENERASI
router.put("/:id", NftController.updateNft);
router.delete("/:id", NftController.deleteNft);
router.get(
  "/:collectionName/:nftName/preview",
  NftController.getNftPreviewByName
);

export default router;
