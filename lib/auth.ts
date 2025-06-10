import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function signSession(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
