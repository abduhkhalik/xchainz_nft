import { isHolderOfIssuer } from "@/lib/xprlUtils";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const COLLECTION_ISSUER = process.env.COLLECTION_ISSUER!; // ganti dengan issuer NFT Anda

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Xaman",
      credentials: {
        signedBy: { label: "SignedBy", type: "text" },
      },
      async authorize(credentials) {
        const signedBy = credentials?.signedBy;
        if (!signedBy) return null;

        const validHolder = await isHolderOfIssuer(signedBy, COLLECTION_ISSUER);
        if (!validHolder) {
          console.log("❌ Bukan holder, akses ditolak");
          throw new Error("NOT_HOLDER"); // lempar error spesifik
        }

        console.log("✅ Holder valid, login diizinkan");
        return { id: signedBy, name: signedBy };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/", error: "/auth/error" },
});

// ⬅️ WAJIB: export GET & POST agar NextAuth jalan
export { handler as GET, handler as POST };
