// app/api/ai/analyze-pyq/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzePYQ } from "@/services/ai";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";
const API_TIMEOUT = 45000;

async function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

async function extractText(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    return {
      text: body.text || "",
      subject: body.subject || "General",
      uid: body.uid || "",
    };
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File;
    const subject = String(form.get("subject") || "General");
    const uid = String(form.get("uid") || "");

    if (!file) return { text: "", subject, uid };

    let text = "";

    try {
      if (file.type === "application/pdf") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdf = await pdfParse(buffer);
        text = pdf.text || "";

        // Binary/garbage check
        const garbage = (text.match(/[^\x00-\x7F]/g) || []).length;
        const totalChars = text.length;
        const garbageRatio = totalChars > 0 ? garbage / totalChars : 1;

        if (garbageRatio > 0.3 || text.startsWith("%PDF") || text.includes("endobj")) {
          console.log("PDF is scanned or unreadable");
          return { text: "", subject, uid };
        }
      } else {
        text = await file.text();

        // Text file binary check
        if (text.startsWith("%PDF") || text.includes("endobj")) {
          return { text: "", subject, uid };
        }
      }
    } catch (e) {
      console.error("File read error:", e);
      return { text: "", subject, uid };
    }

    return {
      text: text.replace(/\s+/g, " ").trim().slice(0, 3000),
      subject,
      uid,
    };
  }

  return { text: "", subject: "General", uid: "" };
}

export async function POST(req: NextRequest) {
  try {
    const { text, subject, uid } = await withTimeout(
      () => extractText(req),
      5000
    );

    // ✅ UID check
    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid" },
        { status: 400 }
      );
    }

    // ✅ Text check — binary PDF detect
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "This PDF is scanned or unreadable. Please upload a selectable PDF or .txt file.",
        },
        { status: 400 }
      );
    }

    console.log("Analyzing PYQ:", subject);
    console.log("Text length:", text.length);

    const result = await withTimeout(
      () => analyzePYQ(text, subject),
      API_TIMEOUT
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("PYQ error:", error);
    return NextResponse.json(
      {
        success: false,
        repeatedQuestions: [],
        importantTopics: [],
        predictions: [],
        trends: [],
        error: error instanceof Error ? error.message : "Failed",
      },
      { status: 500 }
    );
  }
}