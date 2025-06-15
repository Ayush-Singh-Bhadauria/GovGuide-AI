import dbConnect from "../../../src/lib/dbconnect";
import Scheme from "../../../mdoels/scheme.js";
import { NextRequest, NextResponse } from "next/server";

// Bulk upload schemes via CSV (expects array of objects)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { schemes } = await req.json();
    if (!Array.isArray(schemes) || schemes.length === 0) {
      return NextResponse.json({ error: "No scheme data provided" }, { status: 400 });
    }
    // Validate each scheme
    const requiredFields = ["title", "description"];
    const errors: string[] = [];
    const validSchemes = schemes.filter((scheme, idx) => {
      for (const field of requiredFields) {
        if (!scheme[field] || typeof scheme[field] !== "string" || !scheme[field].trim()) {
          errors.push(`Row ${idx + 2}: Missing or invalid '${field}'`); // +2 for CSV header and 0-index
          return false;
        }
      }
      // Optional: Validate link if present
      if (scheme.link && typeof scheme.link === "string" && scheme.link.trim() && !/^https?:\/\//.test(scheme.link)) {
        errors.push(`Row ${idx + 2}: Invalid link format (must start with http/https)`);
        return false;
      }
      return true;
    });
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }
    // Insert valid schemes
    const inserted = await Scheme.insertMany(validSchemes, { ordered: false });
    return NextResponse.json({ message: `Uploaded ${inserted.length} schemes successfully.` });
  } catch (error: any) {
    // Handle duplicate key or validation errors
    if (error?.writeErrors?.length) {
      const details = error.writeErrors.map((e: any) => `Row ${e.index + 2}: ${e.errmsg || e.message}`);
      return NextResponse.json({ error: "Some rows failed to upload", details }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to upload schemes" }, { status: 500 });
  }
}
