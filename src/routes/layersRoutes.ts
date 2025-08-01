// src/routes/layerRoutes.ts
import { Router } from 'express';
import { LayerController } from '../controllers/layersControllers';

const router = Router();

// Rute untuk mengunggah file layer baru
// Gunakan middleware upload.single('layerFile') sebelum controller utama
router.post('/upload', LayerController.uploadLayer, LayerController.createLayerFromFile);

// Rute CRUD lainnya untuk layer tetap sama
router.get('/', LayerController.getAllLayers); // Bisa pakai query param ?categoryId=...
router.get('/:id', LayerController.getLayerById);
// router.post('/', LayerController.createLayer); // Ini tidak lagi digunakan untuk upload file, hanya untuk data manual
router.put('/:id', LayerController.updateLayer);
router.delete('/:id', LayerController.deleteLayer);

export default router;
