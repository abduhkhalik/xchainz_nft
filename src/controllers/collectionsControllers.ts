// src/controllers/collectionsControllers.ts
import { Request, Response } from "express";
import { CollectionService } from "../services/collection";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const CollectionController = {
  /**
   * Get all collections
   */
  async getAll(req: Request, res: Response) {
    try {
      const collections = await CollectionService.getAllCollections();
      return res.json(collections);
    } catch (error) {
      console.error("[CollectionController.getAll]", error);
      return res.status(500).json({ message: "Failed to fetch collections" });
    }
  },

  /**
   * Get collection by ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const collection = await CollectionService.getCollectionById(id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      return res.json(collection);
    } catch (error) {
      console.error("[CollectionController.getById]", error);
      return res.status(500).json({ message: "Failed to fetch collection" });
    }
  },

  /**
   * Create new collection
   */
  async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const newCollection = await CollectionService.createCollection(
        name,
        description
      );
      return res.status(201).json(newCollection);
    } catch (error) {
      console.error("[CollectionController.create]", error);
      return res.status(500).json({ message: "Failed to create collection" });
    }
  },

  /**
   * Update collection
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await CollectionService.updateCollection(id, data);
      return res.json(updated);
    } catch (error) {
      console.error("[CollectionController.update]", error);
      return res.status(500).json({ message: "Failed to update collection" });
    }
  },

  /**
   * Delete collection
   */
  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CollectionService.deleteCollection(id);
      return res.json({ message: "Collection deleted successfully" });
    } catch (error) {
      console.error("[CollectionController.remove]", error);
      return res.status(500).json({ message: "Failed to delete collection" });
    }
  },

  /**
   * Get preview GIF for collection, fallback to default if missing
   */
  async getPreview(req: Request, res: Response) {
    try {
      const { name } = req.params;

      // Cari koleksi berdasarkan nama
      const collection = await prisma.collections.findFirst({
        where: { name },
      });

      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      const previewPath = path.join(
        process.cwd(),
        "public",
        "output",
        collection.name,
        "preview.gif"
      );

      if (fs.existsSync(previewPath)) {
        return res.sendFile(previewPath);
      }

      // Fallback ke default preview
      const fallbackPath = path.join(
        process.cwd(),
        "public",
        "fallback",
        "preview-missing.gif"
      );

      if (fs.existsSync(fallbackPath)) {
        return res.sendFile(fallbackPath);
      }

      // Fallback file juga tidak ditemukan
      console.warn(
        "[CollectionController.getPreview] Preview and fallback missing for:",
        collection.name
      );
      return res.status(404).json({ message: "Preview not found" });
    } catch (error) {
      console.error("[CollectionController.getPreview]", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
