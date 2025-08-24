/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "xrpl";

const NODE = process.env.XRPL_NODE ?? "wss://xrplcluster.com";

// 🗄️ In-memory cache { account: { nfts: [], expires: number } }
const holderCache: Record<
  string,
  { nfts: any[]; expires: number }
> = {};

const CACHE_TTL = 1000 * 60 * 2; // 2 menit TTL cache

/**
 * Mengecek apakah address adalah holder dari NFT koleksi (issuer tertentu).
 * Dengan cache supaya tidak selalu query ke XRPL.
 */
export async function isHolderOfIssuer(
  account: string,
  issuer: string
): Promise<boolean> {
  const now = Date.now();

  // ✅ cek cache dulu
  if (holderCache[account] && holderCache[account].expires > now) {
    console.log(`⚡ Cache hit untuk ${account}`);
    const cachedNFTs = holderCache[account].nfts;

    const match = cachedNFTs.some((nft) => nft.Issuer === issuer);
    if (match) {
      console.log(`✅ (cache) ${account} adalah holder koleksi issuer ${issuer}`);
    } else {
      console.log(`❌ (cache) ${account} bukan holder koleksi issuer ${issuer}`);
    }
    return match;
  }

  console.log(`🌐 Cache miss, fetch account_nfts untuk ${account}`);

  const client = new Client(NODE);
  await client.connect();

  try {
    let marker: string | undefined = undefined;
    let allNFTs: any[] = [];

    do {
      const nfts: {
        result: {
          account_nfts: any[];
          marker?: string;
        };
      } = await client.request({
        command: "account_nfts",
        account,
        marker,
      });

      allNFTs = allNFTs.concat(nfts.result.account_nfts);
      marker = nfts.result.marker;
    } while (marker);

    console.log(`🔎 Wallet ${account} memiliki ${allNFTs.length} NFT:`);

    // log detail semua NFT
    allNFTs.forEach((nft, i) => {
      console.log(
        `   #${i + 1} NFT ID: ${nft.NFTokenID}, Issuer: ${nft.Issuer}, Taxon: ${nft.NFTokenTaxon}`
      );
    });

    // simpan ke cache
    holderCache[account] = {
      nfts: allNFTs,
      expires: now + CACHE_TTL,
    };

    const match = allNFTs.some((nft) => nft.Issuer === issuer);

    if (match) {
      console.log(`✅ Wallet ${account} adalah holder koleksi issuer ${issuer}`);
    } else {
      console.log(`❌ Wallet ${account} BUKAN holder koleksi issuer ${issuer}`);
    }

    return match;
  } catch (err) {
    console.error("❌ Gagal cek holder:", err);
    return false;
  } finally {
    await client.disconnect();
  }
}
