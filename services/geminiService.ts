
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiMovieData } from "../types";

export const fetchMoviePosterAndDetails = async (movieTitle: string): Promise<GeminiMovieData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for the official high-quality movie poster for "${movieTitle}". 
               
               INSTRUCTIONS:
               - The posterUrl MUST be a direct link to an image file (ending in .jpg, .jpeg, or .png).
               - Use official sources like image.tmdb.org or m.media-amazon.com.
               - Return details for: "${movieTitle}" in the following JSON format.
               - description should be a catchy one-sentence summary in Arabic.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          posterUrl: { type: Type.STRING },
          year: { type: Type.STRING },
          genre: { type: Type.STRING },
          imdbRating: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["posterUrl", "year", "genre", "imdbRating", "description"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    // التحقق من صحة الرابط الأساسية
    if (!data.posterUrl || !data.posterUrl.includes('http')) {
      throw new Error("Invalid poster URL");
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch movie details", error);
    // في حال الفشل نعود ببيانات افتراضية مع صورة placeholder تعتمد على الاسم
    return {
      posterUrl: `https://placehold.co/600x900/1e293b/ffffff?text=${encodeURIComponent(movieTitle)}`,
      year: "2024",
      genre: "Movie",
      imdbRating: "N/A",
      description: "جاري تحميل تفاصيل الفيلم..."
    };
  }
};

export const getSimilarMovies = async (movieTitle: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 5 popular movies similar to "${movieTitle}". Return only a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text);
};
