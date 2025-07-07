import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../../src/lib/dbconnect";
import User from "../../../../mdoels/user";
import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        const isMatch = await bcrypt.compare(credentials.password, user.hashed_password);
        if (!isMatch) return null;
        // Return user object for session
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }: { user: NextAuthUser; account: any; profile?: any }) {
      if (account.provider === "google") {
        await dbConnect();
        let existing = await User.findOne({ email: user.email });
        if (!existing) {
          const randomPassword = crypto.randomBytes(32).toString("hex");
          await User.create({
            name: user.name,
            email: user.email,
            hashed_password: randomPassword,
          });
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      // Add user id to session
      if (token && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
