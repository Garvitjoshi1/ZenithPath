import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test Route
app.get("/", (req, res) => {
  res.send("✅ AuraAI Backend is running...");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
