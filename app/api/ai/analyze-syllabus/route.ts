// app/api/ai/analyze-syllabus/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { analyzeSyllabus } from "@/services/ai";

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
    const { text, subject, uid } = await extractText(req);
    if (!text) return NextResponse.json({ error: "Text required" }, { status: 400 });
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await analyzeSyllabus(text, subject);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Syllabus analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
