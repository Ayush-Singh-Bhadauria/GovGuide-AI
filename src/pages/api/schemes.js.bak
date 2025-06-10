import dbConnect from "../../../src/lib/dbconnect";
const Scheme = require("../../../mdoels/scheme");

// Helper to check admin auth
function isAdmin(req) {
  // Check for a session header set after admin login
  return req.headers["x-admin-auth"] === "session";
}

export default async function handler(req, res) {
  await dbConnect();

  // GET: List all schemes (public)
  if (req.method === "GET") {
    const schemes = await Scheme.find({}).sort({ created_at: -1 });
    return res.status(200).json({ schemes });
  }

  // All other methods require admin
  if (!isAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized: Admin only" });
  }

  // POST: Add a new scheme
  if (req.method === "POST") {
    const { title, description, category, eligibility } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newScheme = new Scheme({ title, description, category, eligibility });
    await newScheme.save();
    return res.status(201).json({ message: "Scheme added", scheme: newScheme });
  }

  // PUT: Edit a scheme
  if (req.method === "PUT") {
    const { id, ...updates } = req.body;
    const updated = await Scheme.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: "Scheme not found" });
    return res.status(200).json({ message: "Scheme updated", scheme: updated });
  }

  // DELETE: Remove a scheme
  if (req.method === "DELETE") {
    const { id } = req.body;
    const deleted = await Scheme.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Scheme not found" });
    return res.status(200).json({ message: "Scheme deleted", scheme: deleted });
  }

  return res.status(405).end();
}
