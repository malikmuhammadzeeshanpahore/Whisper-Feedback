import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import { getTokenFromRequest, verifyToken, unauthorizedResponse } from "./lib/auth.js";

export default async (req: Request, context: any) => {
  const path = new URL(req.url).pathname;

  // GET /api/user/check/:username — public, no auth needed
  if (path.startsWith("/api/user/check/")) {
    const username = context.params.username as string;
    if (!username) {
      return Response.json({ error: "Username required" }, { status: 400 });
    }
    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(sql`lower(${users.username}) = lower(${username.trim()})`)
      .limit(1);

    return Response.json(user ? { exists: true, username: user.username } : { exists: false });
  }

  // GET /api/user/me — requires auth
  if (path === "/api/user/me") {
    const token = getTokenFromRequest(req);
    const loggedInAs = token ? verifyToken(token) : null;
    if (!loggedInAs) return unauthorizedResponse("Invalid or missing token");

    const [user] = await db
      .select({ username: users.username })
      .from(users)
      .where(sql`lower(${users.username}) = lower(${loggedInAs})`)
      .limit(1);

    if (!user) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ username: user.username });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
};

export const config: Config = {
  path: ["/api/user/me", "/api/user/check/:username"],
};
