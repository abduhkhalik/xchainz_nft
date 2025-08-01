import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const NftService = {
  async getAllNfts(collectionId?: string) {
    const where = collectionId ? { collectionId } : {};

    const nfts = await prisma.nfts.findMany({
      where,
      include: { collection: true },
      orderBy: { name: "asc" },
    });

    return nfts; // Tetap gunakan imageIpfsUrl, metadataIpfsUrl, dll
  },

  async getNftById(id: string) {
    const nft = await prisma.nfts.findUnique({
      where: { id },
      include: { collection: true },
    });

    return nft;
  },

  async createNft(data: {
    name: string;
    description: string;
    imageIpfsUrl: string; // Tetap gunakan nama ini
    metadataIpfsUrl: string;
    metadataHash: string;
    attributes: Record<string, any>;
    collectionId: string;
    animationIpfsUrl?: string;
    localVideoPath?: string;
    filename?: string;
  }) {
    const collection = await prisma.collections.findUnique({
      where: { id: data.collectionId },
    });

    if (!collection) {
      throw new Error(
        `Collection dengan ID ${data.collectionId} tidak ditemukan.`
      );
    }

    return prisma.nfts.create({
      data: {
        ...data,
        attributes: data.attributes,
      },
    });
  },

  async updateNft(
    id: string,
    data: {
      name?: string;
      description?: string;
      imageIpfsUrl?: string;
      metadataIpfsUrl?: string;
      metadataHash?: string;
      attributes?: Record<string, any>;
      collectionId?: string;
      animationIpfsUrl?: string;
      localVideoPath?: string;
      filename?: string;
    }
  ) {
    if (data.collectionId) {
      const collection = await prisma.collections.findUnique({
        where: { id: data.collectionId },
      });

      if (!collection) {
        throw new Error(
          `Collection dengan ID ${data.collectionId} tidak ditemukan.`
        );
      }
    }

    return prisma.nfts.update({
      where: { id },
      data: {
        ...data,
        attributes: data.attributes,
      },
    });
  },

  async deleteNft(id: string) {
    return prisma.nfts.delete({
      where: { id },
    });
  },

  async findCollectionByName(name: string) {
    return prisma.collections.findFirst({
      where: { name },
    });
  },

  async findNftByNameInCollection(nftName: string, collectionId: string) {
    return prisma.nfts.findFirst({
      where: {
        name: nftName,
        collectionId,
      },
    });
  },
};
