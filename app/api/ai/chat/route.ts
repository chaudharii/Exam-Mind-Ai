// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chatWithAI } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { messages, subject, uid } = await req.json();
    if (!messages || !uid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const reply = await chatWithAI(messages, subject);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
