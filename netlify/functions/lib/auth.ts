import { createHmac, createHash } from "node:crypto";

function getSecret(): string {
  return Netlify.env.get("JWT_SECRET") ?? "fallback_secret_for_secret_message_app_2026_xyz_meta";
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function generateToken(username: string): string {
  const clean = username.trim().toLowerCase();
  const signature = createHmac("sha256", getSecret()).update(clean).digest("hex");
  const payload = Buffer.from(clean).toString("base64");
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  try {
    const username = Buffer.from(payload, "base64").toString("utf-8");
    const expected = createHmac("sha256", getSecret()).update(username).digest("hex");
    return signature === expected ? username : null;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export function unauthorizedResponse(message = "Unauthorized"): Response {
  return Response.json({ error: message }, { status: 401 });
}
