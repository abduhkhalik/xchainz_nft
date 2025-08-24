import { isHolderOfIssuer } from "@/lib/xprlUtils";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const COLLECTION_ISSUER = process.env.COLLECTION_ISSUER!;

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
          // lempar error agar diarahkan ke /auth/error?error=NOT_HOLDER
          throw new Error("NOT_HOLDER");
        }

        console.log("✅ Holder valid, login diizinkan");
        return { id: signedBy, name: signedBy };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { 
    signIn: "/", 
    error: "/auth/error", 
  },
  callbacks: {
    async signIn({ }) {
      return true;
    },
  },
});

export { handler as GET, handler as POST };
