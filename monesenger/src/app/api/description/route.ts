
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

async function fileToGenerativePart(file: File) {
  const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString("base64");
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = "あなたは、ユーザーが撮影した写真を元に、日記風に美しい日本語で自然に、要約を生成するクリエイティブアシスタントです。50文字以上でお願いします。それ以外の説明や文字列は一切含めず、要約のみを返答してください。";
    const imagePart = await fileToGenerativePart(file);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim().replace(/\s/g, '');
    console.log(text);
    // const serial = text.trim().replace(/\s/g, '');
    return NextResponse.json({ text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error processing image." }, { status: 500 });
  }
}
