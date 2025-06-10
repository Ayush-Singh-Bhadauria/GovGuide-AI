import dbConnect from "../../../src/lib/dbconnect";
import Scheme from "../../../mdoels/scheme.js";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const schemes = await Scheme.find({});
  return NextResponse.json({ schemes });
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing scheme id" }, { status: 400 });
    }
    const deleted = await Scheme.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Scheme deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete scheme" }, { status: 500 });
  }
}
