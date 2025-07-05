import dbConnect from "../../../src/lib/dbconnect";
import User from "../../../mdoels/user";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "crypto";

// In-memory store for reset tokens (for demo; use DB/Redis in production)
const resetTokens = new Map();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "No user found with this email" }, { status: 404 });
  }
  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens.set(token, { userId: user._id, expires: Date.now() + 1000 * 60 * 15 }); // 15 min expiry

  // Send email (use your SMTP config)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Nagrik Mitra AI Password Reset",
    text: `Click the link to reset your password: ${resetUrl}`,
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
  });
  return NextResponse.json({ message: "Password reset link sent to your email." });
}

export async function PUT(req: NextRequest) {
  // Accept { token, password } in request body
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }
  const data = resetTokens.get(token);
  if (!data || data.expires < Date.now()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  await dbConnect();
  const user = await User.findById(data.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Always allow password reset: update hashed_password so Google users can now log in with email/password
  user.hashed_password = password; // Will be hashed by pre-save hook
  await user.save();
  resetTokens.delete(token);
  return NextResponse.json({ message: "Password has been reset successfully. You can now log in with your email and new password." });
}
