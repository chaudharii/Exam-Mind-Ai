// app/api/ai/analyze-syllabus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeSyllabus } from "@/services/ai";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let text = "";
    let subject = "General";

    // JSON REQUEST
    if (contentType.includes("application/json")) {
      const body = await req.json();
      text = body?.text || "";
      subject = body?.subject || "General";
    }

    // FORM DATA REQUEST
    else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      subject = (formData.get("subject") as string) || "General";

      if (!file) {
        return NextResponse.json(
          { error: "No file uploaded" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // PDF FILE
      if (file.type === "application/pdf") {
        try {
          const pdfData = await pdfParse(buffer);
          text = pdfData?.text || "";

          // ✅ Binary/scanned PDF check
          const garbage = (text.match(/[^\x00-\x7F]/g) || []).length;
          const ratio = text.length > 0 ? garbage / text.length : 1;

          if (
            ratio > 0.3 ||
            text.startsWith("%PDF") ||
            text.includes("endobj") ||
            text.trim().length < 20
          ) {
            return NextResponse.json(
              {
                error:
                  "This PDF appears to be scanned or image-based. Please upload a selectable/text PDF or a .txt file.",
              },
              { status: 400 }
            );
          }
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          return NextResponse.json(
            { error: "Failed to parse PDF. Try a .txt file instead." },
            { status: 400 }
          );
        }
      }

      // TEXT FILE
      else {
        text = buffer.toString("utf-8");

        // ✅ Binary check for text files
        if (text.startsWith("%PDF") || text.includes("endobj")) {
          return NextResponse.json(
            { error: "File appears to be a binary PDF. Please upload a .txt file." },
            { status: 400 }
          );
        }
      }
    }

    // INVALID CONTENT TYPE
    else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    // VALIDATION
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "No valid text content found. Please upload a readable file." },
        { status: 400 }
      );
    }

    console.log("Analyzing syllabus, text length:", text.length);

    // AI ANALYSIS
    const result = await analyzeSyllabus(
      text.slice(0, 5000),
      subject
    );

    console.log("Analysis success");

    // ✅ Direct result return karo — wrapper nahi
    return NextResponse.json(result);

  } catch (error) {
    console.error("Syllabus analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  }
}