import { isHolderOfIssuer } from "@/lib/xprlUtils";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const COLLECTION_ISSUER = "rXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // ganti dengan issuer NFT Anda

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

        // ✅ cek holder NFT
        const validHolder = await isHolderOfIssuer(signedBy, COLLECTION_ISSUER);
        if (!validHolder) {
          console.log("❌ Bukan holder, akses ditolak");
          return null;
        }

        console.log("✅ Holder valid, login diizinkan");
        return { id: signedBy, name: signedBy };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" }, // optional redirect
});

// ⬅️ WAJIB: export GET & POST agar NextAuth jalan
export { handler as GET, handler as POST };
