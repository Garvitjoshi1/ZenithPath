import express from "express";
import { askGemini } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const reply = await askGemini(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
