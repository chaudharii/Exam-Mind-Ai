// app/api/ai/analyze-syllabus/route.ts

import { NextRequest, NextResponse } from "next/server";
import { analyzeSyllabus } from "@/services/ai";

const pdfParse = require("pdf-parse");

export async function POST(req: NextRequest) {
  try {
    const contentType =
      req.headers.get("content-type") || "";

    let text = "";
    let subject = "General";

    // =========================
    // JSON REQUEST
    // =========================
    if (contentType.includes("application/json")) {
      const body = await req.json();

      text = body.text || "";
      subject = body.subject || "General";
    }

    // =========================
    // FORM DATA REQUEST
    // =========================
    else if (
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();

      const file = formData.get("file") as File | null;

      subject =
        (formData.get("subject") as string) ||
        "General";

      if (!file) {
        return NextResponse.json(
          {
            error: "No file uploaded",
          },
          {
            status: 400,
          }
        );
      }

      const bytes = await file.arrayBuffer();

      const buffer = Buffer.from(bytes);

      // =========================
      // PDF FILE
      // =========================
      if (file.type === "application/pdf") {
        try {
          const pdfData = await pdfParse(buffer);

          text = pdfData.text || "";
        } catch (pdfError) {
          console.error(
            "PDF parsing error:",
            pdfError
          );

          return NextResponse.json(
            {
              error:
                "Failed to read PDF file",
            },
            {
              status: 400,
            }
          );
        }
      }

      // =========================
      // TEXT FILE
      // =========================
      else {
        text = buffer.toString("utf-8");
      }
    }

    // =========================
    // VALIDATION
    // =========================
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        {
          error:
            "No valid text content found",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // ANALYZE
    // =========================
    const result = await analyzeSyllabus(
      text.slice(0, 5000)
    );

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Syllabus analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Analysis failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}