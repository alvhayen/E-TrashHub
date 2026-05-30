import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Testing with maxOutputTokens: 1024");
  const r1 = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Write a 100 word essay about plastic bottles.',
    config: { maxOutputTokens: 1024 }
  });
  console.log("Length:", r1.text?.length);
  console.log("Text:", r1.text?.substring(0, 50));

  console.log("Testing without maxOutputTokens");
  const r2 = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Write a 100 word essay about plastic bottles.'
  });
  console.log("Length:", r2.text?.length);
  console.log("Text:", r2.text?.substring(0, 50));
}

test();
