import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Xaman",
      credentials: {
        signedBy: { label: "SignedBy", type: "text" },
      },

      authorize(credentials) {
        const signedBy = credentials?.signedBy;
        if (!signedBy) return null;

        return {
          id: signedBy,
          name: "XRP User",
          image: `https://xumm.app/avatar/${signedBy}`,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
        },
      };
    },
  },
  pages: {
    signIn: "/", // optional
  },
});

export { handler as GET, handler as POST };
