// src/services/collectionService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CollectionService = {
  async getAllCollections() {
    const collections = await prisma.collections.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        nfts: {
          select: {
            imageIpfsUrl: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Ambil GIF pertama dari setiap koleksi sebagai preview
    return collections.map((collection) => {
      const gif = collection.nfts.find((nft) =>
        nft.imageIpfsUrl?.toLowerCase().endsWith('.gif')
      );
      return {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        totalMinted: collection.totalMinted,
        previewImageUrl: gif?.imageIpfsUrl || null,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      };
    });
  },

  async getCollectionById(id: string) {
    const collection = await prisma.collections.findUnique({
      where: { id },
      include: {
        nfts: {
          select: {
            id: true,
            name: true,
            imageIpfsUrl: true,
            metadataIpfsUrl: true,
            metadataHash: true,
          },
          orderBy: { name: 'asc' },
          take: 100,
        },
      },
    });

    if (!collection) return null;

    // Tetapkan preview image dari NFT .gif pertama
    const gif = collection.nfts.find((nft) =>
      nft.imageIpfsUrl?.toLowerCase().endsWith('.gif')
    );

    return {
      ...collection,
      previewImageUrl: gif?.imageIpfsUrl || null,
    };
  },

  async createCollection(name: string, description: string) {
    return prisma.collections.create({
      data: { name, description },
    });
  },

  async updateCollection(id: string, data: {
    name?: string;
    description?: string;
    totalMinted?: number;
    combinedMetadataIpfsUrl?: string;
    previewImageUrl?: string;
  }) {
    return prisma.collections.update({
      where: { id },
      data,
    });
  },

  async deleteCollection(id: string) {
    await prisma.nfts.deleteMany({
      where: { collectionId: id },
    });

    return prisma.collections.delete({
      where: { id },
    });
  },
};
