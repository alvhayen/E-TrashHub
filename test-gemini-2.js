import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello',
    });
    console.log("Success with gemini-2.5-flash:", response.text);
  } catch(e) {
    console.error("Error with 2.5:", e.message);
  }
}

test();
