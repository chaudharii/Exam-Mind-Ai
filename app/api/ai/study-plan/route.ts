// app/api/ai/study-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateStudyPlan } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { examDate, subjects, preparationLevel, dailyHours, uid } = await req.json();
    if (!examDate || !subjects?.length || !uid) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await generateStudyPlan({ examDate, subjects, preparationLevel, dailyHours });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Study plan error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
