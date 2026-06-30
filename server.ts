import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Enable JSON body parsing
app.use(express.json());

// DB Configuration
const DB_FILE = path.join(process.cwd(), "db.json");

interface Message {
  id: string;
  recipientUsername: string;
  text: string;
  createdAt: string;
}

interface User {
  username: string;
  passwordHash: string;
  createdAt: string;
}

interface Database {
  users: User[];
  messages: Message[];
}

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], messages: [] }, null, 2), "utf-8");
}

function loadDb(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  return { users: [], messages: [] };
}

function saveDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Simple Stateless JWT-like token signature using Node's native crypto
const JWT_SECRET = process.env.GEMINI_API_KEY || "fallback_secret_for_secret_message_app_2026_xyz_meta";

function generateToken(username: string): string {
  const cleanUsername = username.trim().toLowerCase();
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(cleanUsername).digest("hex");
  const payload = Buffer.from(cleanUsername).toString("base64");
  return `${payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  try {
    const username = Buffer.from(payload, "base64").toString("utf-8");
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(username).digest("hex");
    if (signature === expectedSignature) {
      return username;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// Authentication middleware
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token format" });
  }
  const token = authHeader.split(" ")[1];
  const username = verifyToken(token);
  if (!username) {
    return res.status(401).json({ error: "Unauthorized: Invalid session" });
  }
  (req as any).username = username;
  next();
}

// API Routes

// 1. Check user exists
app.get("/api/user/check/:username", (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  const db = loadDb();
  const lowerUsername = username.trim().toLowerCase();
  const user = db.users.find(u => u.username.toLowerCase() === lowerUsername);
  
  if (user) {
    return res.json({ exists: true, username: user.username });
  } else {
    return res.json({ exists: false });
  }
});

// 2. Register
app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  
  const cleanUsername = username.trim();
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return res.status(400).json({ error: "Username must be between 3 and 20 characters long" });
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9_-]+$/;
  if (!alphanumericRegex.test(cleanUsername)) {
    return res.status(400).json({ error: "Username can only contain letters, numbers, underscores, and hyphens" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }
  
  const db = loadDb();
  const lowerUsername = cleanUsername.toLowerCase();
  
  const exists = db.users.some(u => u.username.toLowerCase() === lowerUsername);
  if (exists) {
    return res.status(400).json({ error: "Username is already taken" });
  }
  
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  
  const newUser: User = {
    username: cleanUsername,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  saveDb(db);
  
  const token = generateToken(cleanUsername);
  return res.status(201).json({
    username: cleanUsername,
    token
  });
});

// 3. Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  
  const db = loadDb();
  const lowerUsername = username.trim().toLowerCase();
  const user = db.users.find(u => u.username.toLowerCase() === lowerUsername);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.passwordHash !== passwordHash) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  
  const token = generateToken(user.username);
  return res.json({
    username: user.username,
    token
  });
});

// 4. Get current user
app.get("/api/user/me", authenticate, (req, res) => {
  const db = loadDb();
  const user = db.users.find(u => u.username.toLowerCase() === (req as any).username);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  return res.json({ username: user.username });
});

// 5. Get messages
app.get("/api/messages", authenticate, (req, res) => {
  const db = loadDb();
  const userMessages = db.messages
    .filter(m => m.recipientUsername.toLowerCase() === (req as any).username)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  return res.json({ messages: userMessages });
});

// 6. Delete a message
app.delete("/api/messages/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  
  const messageIdx = db.messages.findIndex(
    m => m.id === id && m.recipientUsername.toLowerCase() === (req as any).username
  );
  
  if (messageIdx === -1) {
    return res.status(404).json({ error: "Message not found or unauthorized" });
  }
  
  db.messages.splice(messageIdx, 1);
  saveDb(db);
  
  return res.json({ success: true });
});

// 7. Send feedback (anonymous)
app.post("/api/messages/send", (req, res) => {
  const { recipientUsername, text } = req.body;
  
  if (!recipientUsername || !text) {
    return res.status(400).json({ error: "Recipient and message text are required" });
  }
  
  const cleanText = text.trim();
  if (cleanText.length === 0) {
    return res.status(400).json({ error: "Message text cannot be empty" });
  }
  if (cleanText.length > 1000) {
    return res.status(400).json({ error: "Message is too long (maximum 1000 characters)" });
  }
  
  const db = loadDb();
  const lowerRecipient = recipientUsername.trim().toLowerCase();
  const recipient = db.users.find(u => u.username.toLowerCase() === lowerRecipient);
  
  if (!recipient) {
    return res.status(404).json({ error: "Recipient user not found" });
  }
  
  const newMessage: Message = {
    id: crypto.randomUUID(),
    recipientUsername: recipient.username,
    text: cleanText,
    createdAt: new Date().toISOString()
  };
  
  db.messages.push(newMessage);
  saveDb(db);
  
  return res.status(201).json({ success: true, messageId: newMessage.id });
});

// Setup dev/prod mode for frontend assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Secret Message Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
