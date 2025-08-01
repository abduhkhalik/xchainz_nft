// src/routes/collectionRoutes.ts
import { Router } from "express";
import { CollectionController } from "../controllers/collectionsControllers";
import { NftController } from "../controllers/nftControllers"; // Menggunakan controller Nft untuk generate

const router = Router();

// --- Rute untuk Generasi NFT (dari NftController) ---
router.post("/generate", NftController.generateNFTs); // Memulai proses generasi

// --- Rute CRUD untuk Koleksi ---
router.get("/", CollectionController.getAll);
router.get("/:name/preview", CollectionController.getPreview);
router.get("/:id", CollectionController.getById);
router.post("/", CollectionController.create);
router.put("/:id", CollectionController.update);
router.delete("/:id", CollectionController.remove);

export default router;
