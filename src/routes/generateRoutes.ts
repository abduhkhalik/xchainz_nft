import { Router } from "express";
import { generateNFTs } from "../controllers/generateController";

const router = Router();

router.post("/generate", generateNFTs);

export default router;