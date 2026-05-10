// app/api/ai/predict-performance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { predictPerformance } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const { attendance, internalMarks, studyHours, syllabusCompletion, subjects, uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await predictPerformance({ attendance, internalMarks, studyHours, syllabusCompletion, subjects });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Performance prediction error:", error);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
