// src/controllers/layerController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { LayerService } from '../services/layers';
import { CategoryService } from '../services/category'; // Untuk memvalidasi kategori
import { existsSync } from 'fs';

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { categoryId } = req.body; // categoryId harus dikirim di body form-data
    if (!categoryId) {
      return cb(new Error('Category ID is required for file upload.'), '');
    }

    try {
      // Pastikan kategori ada sebelum membuat folder
      const category = await CategoryService.getCategoryById(categoryId);
      if (!category) {
        return cb(new Error(`Category with ID ${categoryId} not found.`), '');
      }

      // Path penyimpanan: public/layers/NAMAKATEGORI/
      const uploadPath = path.join(process.cwd(), 'public', 'layers', category.name);
      await fs.mkdir(uploadPath, { recursive: true }); // Buat folder jika belum ada
      cb(null, uploadPath);
    } catch (error: any) {
      cb(new Error(`Failed to set upload destination: ${error.message}`), '');
    }
  },
  filename: (req, file, cb) => {
    // Gunakan nama file asli dengan timestamp untuk menghindari duplikasi
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, fileExtension)}-${uniqueSuffix}${fileExtension}`;
    cb(null, filename);
  },
});

// Filter file untuk hanya mengizinkan video/GIF
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['video/mp4', 'video/quicktime', 'image/gif', 'video/webm', 'video/x-m4v'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video (mp4, mov, webm, m4v) or GIF files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Batasi ukuran file hingga 100MB (sesuaikan)
});

export const LayerController = {
  async getAllLayers(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;
      const layers = await LayerService.getAllLayers(categoryId as string);
      res.status(200).json(layers);
    } catch (error: any) {
      console.error('Error fetching layers:', error.message);
      res.status(500).json({ error: 'Failed to fetch layers' });
    }
  },

  async getLayerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const layer = await LayerService.getLayerById(id);
      if (!layer) {
        return res.status(404).json({ error: 'Layer not found' });
      }
      res.status(200).json(layer);
    } catch (error: any) {
      console.error('Error fetching layer by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch layer' });
    }
  },

  // Fungsi untuk mengunggah file layer
  uploadLayer: upload.single('layerFile'), // Middleware Multer

  async createLayerFromFile(req: Request, res: Response) {
    try {
      const file = req.file;
      const { categoryId, name } = req.body; // Nama layer bisa dikirim dari frontend atau diambil dari nama file

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      if (!categoryId) {
        // Jika categoryId tidak ada, Multer destination mungkin sudah gagal duluan
        return res.status(400).json({ error: 'Category ID is required.' });
      }

      const layerName = name || path.basename(file.originalname, path.extname(file.originalname));
      const filePath = path.join(file.destination, file.filename);
      const fileExtension = path.extname(file.filename);

      const newLayer = await LayerService.createLayer(layerName, filePath, fileExtension, categoryId);
      res.status(201).json(newLayer);
    } catch (error: any) {
      console.error('Error creating layer from file upload:', error.message);
      // Jika ada error setelah Multer menyimpan file, hapus file yang sudah diunggah
      if (req.file && existsSync(req.file.path)) {
        await fs.unlink(req.file.path).catch(e => console.error(`Failed to delete uploaded file: ${e.message}`));
      }
      res.status(400).json({ error: error.message || 'Failed to upload and create layer.' });
    }
  },

  // Fungsi updateLayer dan deleteLayer tetap sama
  async updateLayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, filePath, fileExtension, categoryId } = req.body;
      const updatedLayer = await LayerService.updateLayer(id, { name, filePath, fileExtension, categoryId });
      res.status(200).json(updatedLayer);
    } catch (error: any) {
      console.error('Error updating layer:', error.message);
      res.status(400).json({ error: error.message || 'Failed to update layer' });
    }
  },

  async deleteLayer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await LayerService.deleteLayer(id);
      res.status(204).send(); // No Content
    } catch (error: any) {
      console.error('Error deleting layer:', error.message);
      res.status(400).json({ error: error.message || 'Failed to delete layer' });
    }
  },
};
