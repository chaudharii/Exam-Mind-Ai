// app/api/ai/generate-assignment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateAssignmentAnswer } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { question, subject, uid } = await req.json();

    if (!question || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateAssignmentAnswer(question, subject);

    // Ensure sections always exists
    const response = {
      answer: result.answer || "",
      wordCount: result.wordCount || 0,
      sections: Array.isArray(result.sections) && result.sections.length > 0
        ? result.sections
        : [
            {
              heading: "Answer",
              content: result.answer || "No answer generated",
            },
          ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Assignment error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}