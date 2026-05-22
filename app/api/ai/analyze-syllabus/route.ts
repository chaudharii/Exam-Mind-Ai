// app/api/ai/analyze-syllabus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeSyllabus } from "@/services/ai";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let text = "";
    let subject = "General";

    // Handle both JSON and FormData
    if (contentType.includes("application/json")) {
      const body = await req.json();
      text = body.text || "";
      subject = body.subject || "General";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      subject = (formData.get("subject") as string) || "General";

      if (file) {
        const buffer = await file.arrayBuffer();
        text = Buffer.from(buffer).toString("utf-8");
      }
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "No valid text content found. Please upload a valid file." },
        { status: 400 }
      );
    }

    const result = await analyzeSyllabus(text.slice(0, 5000));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Syllabus analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}