import { isHolderOfIssuer } from "@/lib/xprlUtils";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const COLLECTION_ISSUER = process.env.COLLECTION_ISSUER!; // issuer NFT Anda

// Extend the User type to include 'address'
declare module "next-auth" {
  interface User {
    address?: string;
  }
  interface Session {
    user: {
      address?: string;
      name?: string;
      id?: string;
    };
  }
}

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
        // kirim address sebagai user.id
        return { id: signedBy, name: signedBy, address: signedBy };
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
