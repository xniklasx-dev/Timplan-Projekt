import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";

const router = Router();

// POST /auth/login
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  let users;
  try {
    users = JSON.parse(readFileSync("./mockData/mockUsers.json", "utf-8"));
  } catch (error) {
    console.error("Error reading mockUsers.json:", error);
    return res.status(500).json({ error: "Failed to read users data" });
  }

  const user = users.find(
    (u: { email: string; password: string }) =>
      u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    token: user.token ?? "mock-token-fallback",
  });
});

// POST /auth/register
router.post("/auth/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required" });
  }

  let users;
  try {
    users = JSON.parse(readFileSync("./mockData/mockUsers.json", "utf-8"));
  } catch (error) {
    console.error("Error reading mockUsers.json:", error);
    return res.status(500).json({ error: "Failed to read users data" });
  }

  const existingUser = users.find(
    (u: { email: string }) => u.email === email
  );

  if (existingUser) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    password,
    token: "mock-token-" + Date.now(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Zurückschreiben in mockUsers.json
  try {
    writeFileSync("./mockData/mockUsers.json", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing mockUsers.json:", error);
    return res.status(500).json({ error: "Failed to save user" });
  }

  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    token: newUser.token,
  });
});

// POST /auth/logout
router.post("/auth/logout", (_req, res) => {
  // Später: Session/Token invalidieren
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;