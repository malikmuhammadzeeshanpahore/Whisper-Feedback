import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { messages, users } from "../../db/schema.js";
import { eq, sql, desc } from "drizzle-orm";
import { getTokenFromRequest, verifyToken, unauthorizedResponse } from "./lib/auth.js";
import { randomUUID } from "node:crypto";

export default async (req: Request, context: any) => {
  const token = getTokenFromRequest(req);
  const loggedInAs = token ? verifyToken(token) : null;
  if (!loggedInAs) return unauthorizedResponse("Invalid or missing token");

  // GET /api/messages — list inbox
  if (req.method === "GET") {
    const inbox = await db
      .select()
      .from(messages)
      .where(sql`lower(${messages.recipientUsername}) = lower(${loggedInAs})`)
      .orderBy(desc(messages.createdAt));

    const formatted = inbox.map((m) => ({
      id: m.id,
      recipientUsername: m.recipientUsername,
      text: m.text,
      createdAt: m.createdAt?.toISOString(),
    }));

    return Response.json({ messages: formatted });
  }

  // DELETE /api/messages/:id
  if (req.method === "DELETE") {
    const id = context.params.id as string;
    if (!id) return Response.json({ error: "Message ID required" }, { status: 400 });

    const [msg] = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    if (!msg || msg.recipientUsername.toLowerCase() !== loggedInAs.toLowerCase()) {
      return Response.json({ error: "Message not found or unauthorized" }, { status: 404 });
    }

    await db.delete(messages).where(eq(messages.id, id));
    return Response.json({ success: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: ["/api/messages", "/api/messages/:id"],
};
