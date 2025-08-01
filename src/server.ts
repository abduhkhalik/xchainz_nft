// src/server.ts

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Impor semua rute baru
import categoryRoutes from "./routes/categoryRoutes";
import layerRoutes from "./routes/layersRoutes";
import collectionRoutes from "./routes/collectionRoutes"; // Ini adalah rute untuk koleksi & generate
import nftRoutes from "./routes/nftRoutes"; // Ini adalah rute untuk CRUD NFT individual
import generateRoutes from "./routes/generateRoutes";
import path from "path";

dotenv.config();

const app = express();
app.use("/public", express.static(path.join(__dirname, "../public")));
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// ✅ Tambahkan ini

// Rute API
// Prefix yang jelas untuk setiap entitas
app.use("/api/categories", categoryRoutes);
app.use("/api/layers", layerRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/nfts", nftRoutes);
app.use("/api/generate", generateRoutes);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  if (!process.env.PINATA_JWT) {
    console.warn("⚠️ PINATA_JWT is not set. Pinata uploads will fail.");
  }
  if (!process.env.IPFS_GATEWAY) {
    console.warn(
      "⚠️ IPFS_GATEWAY is not set. Using default Pinata gateway (https://gateway.pinata.cloud/ipfs/)."
    );
  }
});
