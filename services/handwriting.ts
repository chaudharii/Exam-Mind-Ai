// services/handwriting.ts
// Generates handwritten-style assignment PDFs

export interface HandwritingOptions {
  inkColor?: string;
  paperStyle?: "ruled" | "plain" | "grid";
  fontSize?: number;
  lineHeight?: number;
}

// Generate handwritten-style HTML for a page
export function generateHandwrittenPage(
  content: string,
  pageNumber: number,
  totalPages: number,
  studentName: string,
  subject: string,
  options: HandwritingOptions = {}
): string {
  const {
    inkColor = "#1a3a6b",
    paperStyle = "ruled",
    fontSize = 18,
    lineHeight = 38,
  } = options;

  // Split content into lines that fit on page
  const lines = wrapText(content, 65);

  const ruledBackground =
    paperStyle === "ruled"
      ? `repeating-linear-gradient(
          transparent,
          transparent ${lineHeight - 1}px,
          #c8d3e8 ${lineHeight - 1}px,
          #c8d3e8 ${lineHeight}px
        )`
      : "none";

  return `
    <div class="page" style="
      width: 794px;
      min-height: 1123px;
      background: #f8f6f0;
      background-image: ${ruledBackground};
      background-size: 100% ${lineHeight}px;
      padding: 60px 80px 60px 120px;
      position: relative;
      font-family: 'Caveat', 'Dancing Script', cursive;
      page-break-after: always;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      margin: 0 auto 20px;
    ">
      <!-- Left margin red line -->
      <div style="
        position: absolute;
        left: 100px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e88080;
        opacity: 0.7;
      "></div>
      
      <!-- Hole punches -->
      <div style="position: absolute; left: 20px; top: 150px; width: 20px; height: 20px; border-radius: 50%; background: #e8e0d0; border: 1px solid #ccc;"></div>
      <div style="position: absolute; left: 20px; top: 400px; width: 20px; height: 20px; border-radius: 50%; background: #e8e0d0; border: 1px solid #ccc;"></div>
      <div style="position: absolute; left: 20px; top: 650px; width: 20px; height: 20px; border-radius: 50%; background: #e8e0d0; border: 1px solid #ccc;"></div>
      <div style="position: absolute; left: 20px; top: 900px; width: 20px; height: 20px; border-radius: 50%; background: #e8e0d0; border: 1px solid #ccc;"></div>
      
      <!-- Header (first page only) -->
      ${
        pageNumber === 1
          ? `
        <div style="margin-bottom: 20px; border-bottom: 2px solid ${inkColor}; padding-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; color: ${inkColor}; line-height: ${lineHeight}px;">
            <span>Name: ${studentName}</span>
            <span>Subject: ${subject}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; color: ${inkColor}; line-height: ${lineHeight}px;">
            <span>Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span>Page: ${pageNumber}/${totalPages}</span>
          </div>
        </div>
      `
          : `
        <div style="display: flex; justify-content: flex-end; font-size: 14px; color: ${inkColor}; margin-bottom: 10px; opacity: 0.7;">
          Page ${pageNumber}/${totalPages}
        </div>
      `
      }
      
      <!-- Content -->
      <div style="color: ${inkColor}; font-size: ${fontSize}px; line-height: ${lineHeight}px; transform: rotate(-0.3deg);">
        ${lines
          .map(
            (line, i) =>
              `<div style="height: ${lineHeight}px; display: flex; align-items: center; ${getLineVariation(i)}">${escapeHtml(line)}</div>`
          )
          .join("")}
      </div>
    </div>
  `;
}

// Add slight natural variation to handwriting
function getLineVariation(index: number): string {
  const rotations = ["-0.2deg", "0.1deg", "-0.1deg", "0.2deg", "0deg"];
  const rotation = rotations[index % rotations.length];
  return `transform: rotate(${rotation});`;
}

// Wrap text to fit within line length
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.replace(/\n/g, " \n ").split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (word === "\n") {
      lines.push(currentLine.trim());
      currentLine = "";
    } else if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = (currentLine + " " + word).trim();
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Split content into pages
export function splitIntoPages(content: string, linesPerPage: number = 28): string[] {
  const allLines = wrapText(content, 65);
  const pages: string[] = [];

  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage).join("\n"));
  }

  return pages;
}

// Generate complete HTML document for PDF
export function generateHandwrittenHTML(
  content: string,
  studentName: string,
  subject: string,
  question: string,
  options: HandwritingOptions = {}
): string {
  const fullContent = `Q: ${question}\n\nAns: ${content}`;
  const pages = splitIntoPages(fullContent);
  const totalPages = pages.length;

  const pageHTMLs = pages.map((pageContent, i) =>
    generateHandwrittenPage(
      pageContent,
      i + 1,
      totalPages,
      studentName,
      subject,
      options
    )
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #e0e0e0; padding: 20px; }
        @media print {
          body { background: white; padding: 0; }
          .page { box-shadow: none; margin: 0; }
        }
      </style>
    </head>
    <body>
      ${pageHTMLs.join("\n")}
    </body>
    </html>
  `;
}
