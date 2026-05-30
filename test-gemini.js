import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    console.log("Testing Gemini API with key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'hello',
    });
    console.log("Success:", response.text);
  } catch(e) {
    console.error("Error from Gemini API:", e);
  }
}

test();
