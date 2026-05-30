import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const schema = {
  type: "OBJECT",
  properties: {
    detectedItems: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          category: { type: "STRING" },
          categoryLabel: { type: "STRING" },
          confidence: { type: "NUMBER" }
        }
      }
    },
    estimatedWeight: { type: "STRING" },
    estimatedPoints: { type: "NUMBER" },
    sortingTips: { type: "STRING" },
    environmentalMessage: { type: "STRING" },
    isRecyclable: { type: "BOOLEAN" },
    warningNote: { type: "STRING", nullable: true }
  }
};

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Analyze this waste (pretend it is a plastic bottle)',
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.2
    }
  });

  console.log(response.text);
}

test();
