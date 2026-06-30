import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { hashPassword, generateToken } from "./lib/auth.js";
import { randomUUID } from "node:crypto";

export default async (req: Request, context: any) => {
  const action = context.params.action as string;

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password } = body ?? {};

  if (!username || !password) {
    return Response.json({ error: "Username and password are required" }, { status: 400 });
  }

  if (action === "register") {
    const clean = username.trim();
    if (clean.length < 3 || clean.length > 20) {
      return Response.json({ error: "Username must be between 3 and 20 characters" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
      return Response.json({ error: "Username can only contain letters, numbers, underscores, and hyphens" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.username}) = lower(${clean})`)
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ error: "Username is already taken" }, { status: 400 });
    }

    const [created] = await db
      .insert(users)
      .values({ username: clean, passwordHash: hashPassword(password) })
      .returning({ username: users.username });

    const token = generateToken(created.username);
    return Response.json({ username: created.username, token }, { status: 201 });
  }

  if (action === "login") {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.username}) = lower(${username.trim()})`)
      .limit(1);

    if (!user || user.passwordHash !== hashPassword(password)) {
      return Response.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = generateToken(user.username);
    return Response.json({ username: user.username, token });
  }

  return Response.json({ error: "Unknown action" }, { status: 404 });
};

export const config: Config = {
  path: "/api/auth/:action",
};
