// app/api/ai/predict-performance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { predictPerformance } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const {
      attendance,
      internalMarks,
      studyHours,
      syllabusCompletion,
      subjects,
      uid,
    } = await req.json();

    if (!subjects || subjects.length === 0) {
      return NextResponse.json(
        { error: "Add at least one subject" },
        { status: 400 }
      );
    }

    const result = await predictPerformance({
      attendance,
      internalMarks,
      studyHours,
      syllabusCompletion,
      subjects,
    });

    // Ensure all arrays exist
    const response = {
      passProbability: result.passProbability || 0,
      predictedMarks: result.predictedMarks || 0,
      grade: result.grade || "N/A",
      weakSubjects: Array.isArray(result.weakSubjects) ? result.weakSubjects : [],
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      breakdown: Array.isArray(result.breakdown) ? result.breakdown : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}