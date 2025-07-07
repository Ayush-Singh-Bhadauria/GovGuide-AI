import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "../../../src/lib/dbconnect";
import User from "../../../mdoels/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// DEPRECATED: Use NextAuth Credentials provider for login. This endpoint is no longer used.
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Use /api/auth/signin for login." }, { status: 400 });
}
