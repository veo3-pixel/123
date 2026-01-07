import { GoogleGenAI } from "@google/genai";
import { Order, MenuItem } from "../types";

/**
 * AI services enabled using Netlify Environment Variables.
 * Uses the @google/genai SDK for restaurant analytics and marketing.
 */

const initAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateBusinessInsight = async (orders: Order[]): Promise<string> => {
  const ai = initAI();
  if (!ai) return "AI Insights are currently unavailable. Please ensure API_KEY is set in Netlify environment variables.";

  try {
    const orderDataSummary = orders.map(o => ({
      total: o.total,
      type: o.type,
      items: o.items.map(i => i.name).join(', ')
    })).slice(0, 10);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these recent restaurant orders and provide a one-sentence business insight: ${JSON.stringify(orderDataSummary)}`,
      config: {
        systemInstruction: "You are a senior restaurant consultant for a traditional Pakistani restaurant. Be concise and professional."
      }
    });

    return response.text || "No insights generated at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI insights. Check your API configuration.";
  }
};

export const generateMarketingCopy = async (item: MenuItem): Promise<string> => {
  const ai = initAI();
  if (!ai) return item.description || "Authentic Pakistani taste.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, appetizing marketing slogan (maximum 10 words) for this dish: ${item.name}. Description: ${item.description}`,
    });

    return response.text || item.description || "A delicacy from Subhan Khan Shinwari Dera.";
  } catch (error) {
    return item.description || "Traditional Pakistani taste prepared with fresh ingredients.";
  }
};