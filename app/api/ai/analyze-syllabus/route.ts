// app/api/ai/analyze-syllabus/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { analyzeSyllabus } from "@/services/ai";

const API_TIMEOUT = 45000; // 45 seconds

async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

async function extractText(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    const subject = formData.get("subject")?.toString() || "General";
    const uid = formData.get("uid")?.toString() || "";

    if (!uid) return { text: "", subject, uid };

    let text = "";
    if (file instanceof Blob) {
      const fileName = file instanceof File ? file.name.toLowerCase() : "";
      if (file.type === "application/pdf" || fileName.endsWith(".pdf")) {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const parsed = await pdfParse(buffer);
          text = parsed.text || "";
        } catch (err) {
          console.warn("PDF parsing failed for syllabus file, falling back to raw text", err);
          text = await file.text();
        }
      } else {
        text = await file.text();
      }
    } else {
      text = formData.get("text")?.toString() || "";
    }

    return { text, subject, uid };
  }

  return await req.json();
}

export async function POST(req: NextRequest) {
  try {
    const { text, subject, uid } = await withTimeout(() => extractText(req), 5000);
    if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log(`Analyzing syllabus for subject: ${subject}, text length: ${text.length}`);
    const result = await withTimeout(() => analyzeSyllabus(text, subject), API_TIMEOUT);
    console.log("Syllabus analysis complete");
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Syllabus analysis error:", errorMessage);
    if (errorMessage.includes("timeout")) {
      return NextResponse.json({ error: "Analysis timeout - try a smaller file" }, { status: 504 });
    }
    return NextResponse.json({ error: errorMessage || "Analysis failed" }, { status: 500 });
  }
}
