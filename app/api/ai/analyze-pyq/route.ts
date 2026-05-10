// app/api/ai/analyze-pyq/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzePYQ } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, subject, uid } = await req.json();
    if (!text || !uid) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const result = await analyzePYQ(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("PYQ analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
