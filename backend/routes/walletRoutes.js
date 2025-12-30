import express from "express";
const router = express.Router();

// Basic wallet routes
router.get("/", (req, res) => {
    res.json({ message: "Wallet API is working" });
});

router.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Wallet API is running",
        timestamp: new Date().toISOString()
    });
});

export default router;
