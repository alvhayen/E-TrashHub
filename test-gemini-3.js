import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Test prompt: please output a JSON with a single key 'test' and value 'ok'" }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, 
        maxOutputTokens: 1024,
      }
    });
    console.log("Success with gemini-2.5-flash complex payload:", response.text);
  } catch(e) {
    console.error("Error with 2.5 complex payload:", e.message);
  }
}

test();
