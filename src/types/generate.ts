export interface GenerateNFTsParams {
  total: number;
  collectionName: string;
  description: string;
  targetResolution?: {
    width: number;
    height: number;
  };
  targetFPS?: number;
}

// Detail NFT yang dihasilkan untuk respons
export interface GeneratedNFTDetail {
  id: string;
  name: string;
  // Mengubah dari IPFS URL menjadi path lokal relatif
  imagePath: string;
  metadataPath: string;
  metadataHash: string;
}

// Respons dari layanan generasi NFT
export interface NftGenerationServiceResponse {
  message: string;
  logs: string[];
  collectionId: string;
  totalCreated: number;
  nfts: GeneratedNFTDetail[];
  // Mengubah dari IPFS URL menjadi path lokal relatif
  combinedMetadataPath: string | null;
  previewImagePath: string | null;
}