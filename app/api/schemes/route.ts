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

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { title, description, category, eligibility, link } = await req.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const newScheme = await Scheme.create({ title, description, category, eligibility, link });
    return NextResponse.json({ message: "Scheme added", scheme: newScheme }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save scheme" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, ...updates } = await req.json();
    // Ensure link can be updated
    const updated = await Scheme.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
    return NextResponse.json({ message: "Scheme updated", scheme: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update scheme" }, { status: 500 });
  }
}
