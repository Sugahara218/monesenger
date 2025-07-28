import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: '思い出の内容を要約した10単語以内の短いタイトル。'
    },
    summary: {
      type: Type.STRING,
      description: '思い出を表現する一行の詩的な要約。'
    }
  },
  required: ['title', 'summary']
};

export async function enhanceMemoryWithAI(userText: string): Promise<{ title: string; summary: string }>{
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `この思い出にぴったりのタイトルと一行の要約を考えてください。\n\n思い出：\n${userText}`,
      config: {
        systemInstruction: "あなたは、ユーザーが入力した思い出の文章を元に、詩的で美しい要約とタイトルを生成するクリエイティブアシスタントです。日本の文化や感性に寄り添った、心に響く言葉を選んでください。",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const responseText = response.text ?? "";
    const jsonText = responseText.trim();
    const result = JSON.parse(jsonText);
    
    return {
        title: result.title || "無題",
        summary: result.summary || "特別な思い出"
    };

  } catch (error) {
    console.error("Error enhancing memory with AI:", error);
    throw new Error("Failed to process memory with Gemini API.");
  }
};