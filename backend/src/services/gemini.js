import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function askGemini(message) {
  const contextPrompt = `
  You are AuraAI, a confidential and empathetic mental wellness assistant for youth.
  - Respond kindly and non-judgmentally.
  - Keep answers short (2–4 sentences).
  - If user expresses crisis (self-harm/suicidal), gently suggest helplines in India like NIMHANS 1800-599-0019.
  - You may respond in Hinglish or English depending on tone of user.
  `;
  
  const result = await model.generateContent([contextPrompt, message]);
  return result.response.text();
}
