// This file is deprecated. Please use /api/auth/[...nextauth]/route.ts for NextAuth config.

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // You can add custom logic here (e.g., allow only certain domains)
      return true;
    },
    async session({ session, token, user }) {
      // Add custom session fields if needed
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
