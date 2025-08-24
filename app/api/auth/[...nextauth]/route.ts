import { isHolderOfIssuer } from "@/lib/xprlUtils";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const COLLECTION_ISSUER = process.env.COLLECTION_ISSUER!; // issuer NFT Anda

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Xaman",
      credentials: {
        signedBy: { label: "SignedBy", type: "text" },
      },
      async authorize(credentials) {
        try {
          const signedBy = credentials?.signedBy;
          if (!signedBy) return null;

          const validHolder = await isHolderOfIssuer(
            signedBy,
            COLLECTION_ISSUER
          );
          if (!validHolder) {
            throw new Error("NOT_HOLDER");
          }

          return { id: signedBy, name: signedBy, address: signedBy };
        } catch (err) {
          console.error("Authorize error:", err);
          throw new Error("CREDENTIALS_ERROR");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/", error: "/auth/error" },

  callbacks: {
    // inject address ke token JWT
    async jwt({ token, user }) {
      if (user) {
        token.address = user.address; // tambahkan address
      }
      return token;
    },
    // inject address ke session (client-side)
    async session({ session, token }) {
      if (token?.address) {
        session.user.address = token.address as string;
      }
      return session;
    },
  },
});

// WAJIB: export GET & POST agar NextAuth jalan
export { handler as GET, handler as POST };
