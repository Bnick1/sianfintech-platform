import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Test server working" });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});