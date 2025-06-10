import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/auth";
import dbConnect from "../../../src/lib/dbconnect";
import User from "../../../mdoels/user.js";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const user = await User.findById(session.userId).select("-hashed_password");
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const body = await req.json();
  // Allow email to be updated
  const updateFields = { ...body };
  delete updateFields._id;
  // Update user in DB
  const user = await User.findByIdAndUpdate(
    session.userId,
    { $set: updateFields },
    { new: true, runValidators: true, fields: { hashed_password: 0 } }
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // If email was changed, update the session cookie
  if (body.email && body.email !== session.email) {
    const { signSession } = await import("../../../lib/auth");
    const newToken = signSession({ userId: user._id, email: user.email });
    const response = NextResponse.json({ user });
    response.cookies.set("session", newToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }
  return NextResponse.json({ user });
}
