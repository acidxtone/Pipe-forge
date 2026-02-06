import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();
const SALT_ROUNDS = 12;

router.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, securityQuestion, securityAnswer } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "Security question and answer are required" });
    }

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existing.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const answerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), SALT_ROUNDS);

    const nameParts = fullName ? fullName.trim().split(/\s+/) : [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(" ") || null;

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName?.trim() || null,
        firstName,
        lastName,
        securityQuestion,
        securityAnswer: answerHash,
      })
      .returning();

    (req.session as any).userId = user.id;

    const { passwordHash: _, securityAnswer: _sa, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    (req.session as any).userId = user.id;

    const { passwordHash: _, securityAnswer: _sa, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.post("/api/auth/forgot-password/verify-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({ message: "No security question set for this account. Please contact support." });
    }

    res.json({ securityQuestion: user.securityQuestion });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/api/auth/forgot-password/verify-answer", async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer) {
      return res.status(400).json({ message: "Email and security answer are required" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (!user || !user.securityAnswer) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const valid = await bcrypt.compare(securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!valid) {
      return res.status(401).json({ message: "Incorrect answer. Please try again." });
    }

    const resetToken = crypto.randomUUID();
    (req.session as any).resetToken = resetToken;
    (req.session as any).resetEmail = email.toLowerCase().trim();

    res.json({ resetToken });
  } catch (error) {
    console.error("Verify answer error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/api/auth/forgot-password/reset", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const sessionToken = (req.session as any)?.resetToken;
    const sessionEmail = (req.session as any)?.resetEmail;

    if (!sessionToken || sessionToken !== resetToken || sessionEmail !== email.toLowerCase().trim()) {
      return res.status(403).json({ message: "Invalid or expired reset session. Please start over." });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, email.toLowerCase().trim()));

    delete (req.session as any).resetToken;
    delete (req.session as any).resetEmail;

    res.json({ message: "Password reset successful. You can now sign in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed. Please try again." });
  }
});

router.get("/api/auth/user", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { passwordHash: _, securityAnswer: _sa, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.patch("/api/auth/user", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { selectedYear } = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (selectedYear !== undefined) {
      updateData.selectedYear = selectedYear;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { passwordHash: _, securityAnswer: _sa, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

export default router;
