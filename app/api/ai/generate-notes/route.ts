// app/api/ai/generate-notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateNotes } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { subject, topic, noteType, uid } = await req.json();

    if (!subject || !topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateNotes(topic, subject, noteType || "short");

    // Ensure all fields exist
    const response = {
      title: result.title || `${topic} Notes`,
      content: result.content || "No content generated",
      keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
      formulas: Array.isArray(result.formulas) ? result.formulas : [],
      definitions: result.definitions && typeof result.definitions === "object"
        ? result.definitions
        : {},
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Notes error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}