import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const CategoryService = {
  async getAllCategories() {
    return prisma.categorys.findMany({
      orderBy: { name: "asc" },
    });
  },

  async getCategoryById(id: string) {
    return prisma.categorys.findUnique({
      where: { id },
    });
  },

  async createCategory(name: string) {
    return prisma.categorys.create({
      data: { name },
    });
  },

  async updateCategory(id: string, name: string) {
    return prisma.categorys.update({
      where: { id },
      data: { name },
    });
  },

  async deleteCategory(id: string) {
    // Pastikan tidak ada layer yang terkait sebelum menghapus kategori
    const layersCount = await prisma.layers.count({
      where: { categoryId: id },
    });

    if (layersCount > 0) {
      throw new Error(
        `Kategori tidak dapat dihapus karena masih ada ${layersCount} layer yang terkait.`
      );
    }

    return prisma.categorys.delete({
      where: { id },
    });
  },
};
