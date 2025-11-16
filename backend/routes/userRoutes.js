// routes/userRoutes.js
import express from "express";
import { getDB } from "../db.js";

const router = express.Router();

// ✅ Register user with validation & duplicate check
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // 1️⃣ Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        status: "error",
        message: "Name, email, and phone are required",
      });
    }

    const db = getDB();
    const users = db.collection("users");

    // 2️⃣ Duplicate email check
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already registered",
      });
    }

    // Insert new user
    const result = await users.insertOne({ name, email, phone, createdAt: new Date() });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      userId: result.insertedId,
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// 3️⃣ GET all users (for testing/debugging)
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection("users").find().toArray();
    res.status(200).json({ status: "success", users });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
