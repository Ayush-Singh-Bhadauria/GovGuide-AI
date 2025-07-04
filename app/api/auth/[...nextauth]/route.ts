import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "../../../../src/lib/dbconnect";
import User from "../../../../mdoels/user";
import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
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
    async session({ session, token, user }: { session: Session; token?: any; user?: NextAuthUser }) {
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
