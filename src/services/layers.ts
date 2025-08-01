// src/services/layerService.ts
import { PrismaClient, Prisma } from '@prisma/client'; // DIPERBAIKI: Impor Prisma namespace
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { isValidVideo } from '../utils/ffmpeg'; // Impor fungsi validasi video

const prisma = new PrismaClient();

export const LayerService = {
  async getAllLayers(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};
    return prisma.layers.findMany({ // DIPERBAIKI: Gunakan prisma.layers
      where,
      include: { category: true }, // Sertakan data kategori
      orderBy: { name: 'asc' },
    });
  },

  async getLayerById(id: string) {
    return prisma.layers.findUnique({ // DIPERBAIKI: Gunakan prisma.layers
      where: { id },
      include: { category: true },
    });
  },

  // Fungsi createLayer yang diperbarui untuk mendukung upload
  async createLayer(name: string, filePath: string, fileExtension: string, categoryId: string) {
    const category = await prisma.categorys.findUnique({ where: { id: categoryId } }); // DIPERBAIKI: Gunakan prisma.categorys
    if (!category) {
      throw new Error(`Kategori dengan ID ${categoryId} tidak ditemukan.`);
    }

    // Verifikasi bahwa file yang diunggah adalah video yang valid
    const fullPath = path.resolve(filePath);
    if (!existsSync(fullPath)) {
        throw new Error(`File layer tidak ditemukan di path: ${fullPath}. Pastikan file diunggah dengan benar.`);
    }
    const isVideoValid = await isValidVideo(fullPath);
    if (!isVideoValid) {
        // Hapus file yang tidak valid jika ada
        await fs.unlink(fullPath).catch(e => console.error(`Gagal menghapus file tidak valid: ${e.message}`));
        throw new Error(`File yang diunggah bukan format video atau GIF yang valid: ${path.basename(filePath)}`);
    }

    return prisma.layers.create({ // DIPERBAIKI: Gunakan prisma.layers
      data: { name, filePath, fileExtension, categoryId },
    });
  },

  async updateLayer(id: string, data: { name?: string; filePath?: string; fileExtension?: string; categoryId?: string }) {
    if (data.categoryId) {
      const category = await prisma.categorys.findUnique({ where: { id: data.categoryId } }); // DIPERBAIKI: Gunakan prisma.categorys
      if (!category) {
        throw new Error(`Kategori dengan ID ${data.categoryId} tidak ditemukan.`);
      }
    }
    if (data.filePath) {
        const fullPath = path.resolve(data.filePath);
        if (!existsSync(fullPath)) {
            console.warn(`Peringatan: File layer tidak ditemukan di path: ${fullPath}`);
        }
        // Anda mungkin ingin menambahkan validasi isValidVideo di sini juga jika filePath berubah
    }

    return prisma.layers.update({ // DIPERBAIKI: Gunakan prisma.layers
      where: { id },
      data,
    });
  },

  async deleteLayer(id: string) {
    const layer = await prisma.layers.findUnique({ where: { id } }); // DIPERBAIKI: Gunakan prisma.layers
    if (!layer) {
      throw new Error('Layer tidak ditemukan.');
    }

    try {
        const fullPath = path.resolve(layer.filePath);
        if (existsSync(fullPath)) {
            await fs.unlink(fullPath);
            console.log(`File fisik layer dihapus: ${fullPath}`);
        }
    } catch (error: any) {
        console.error(`Gagal menghapus file fisik layer ${layer.filePath}: ${error.message}`);
    }

    return prisma.layers.delete({ // DIPERBAIKI: Gunakan prisma.layers
      where: { id },
    });
  },
};
