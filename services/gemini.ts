
import { GoogleGenAI } from "@google/genai";

export const getSmartFoodAdvice = async (query: string, location?: { latitude: number, longitude: number }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `The user is looking for food in Warangal, Telangana. Query: ${query}`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: location ? {
            latitude: location.latitude,
            longitude: location.longitude
          } : undefined
        }
      }
    },
  });

  const text = response.text || "I couldn't find specific details for that.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const links = groundingChunks
    .filter((chunk: any) => chunk.maps?.uri)
    .map((chunk: any) => ({
      title: chunk.maps.title,
      url: chunk.maps.uri
    }));

  return { text, links };
};
