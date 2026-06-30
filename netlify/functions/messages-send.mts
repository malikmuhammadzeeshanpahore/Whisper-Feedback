import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { messages, users } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { recipientUsername, text } = body ?? {};

  if (!recipientUsername || !text) {
    return Response.json({ error: "Recipient and message text are required" }, { status: 400 });
  }

  const clean = text.trim();
  if (clean.length === 0) {
    return Response.json({ error: "Message text cannot be empty" }, { status: 400 });
  }
  if (clean.length > 1000) {
    return Response.json({ error: "Message is too long (maximum 1000 characters)" }, { status: 400 });
  }

  const [recipient] = await db
    .select({ username: users.username })
    .from(users)
    .where(sql`lower(${users.username}) = lower(${recipientUsername.trim()})`)
    .limit(1);

  if (!recipient) {
    return Response.json({ error: "Recipient user not found" }, { status: 404 });
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      id: randomUUID(),
      recipientUsername: recipient.username,
      text: clean,
    })
    .returning({ id: messages.id });

  return Response.json({ success: true, messageId: inserted.id }, { status: 201 });
};

export const config: Config = {
  path: "/api/messages/send",
};
