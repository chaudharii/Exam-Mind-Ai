// utils/index.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function bytesToMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Parse text from PDF ArrayBuffer (client-side helper)
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || "");
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Download blob as file
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Color for probability scores
export function getProbabilityColor(probability: number): string {
  if (probability >= 80) return "text-green-500";
  if (probability >= 60) return "text-yellow-500";
  if (probability >= 40) return "text-orange-500";
  return "text-red-500";
}

export function getGradeColor(grade: string): string {
  const gradeColors: Record<string, string> = {
    "A+": "text-green-500",
    A: "text-green-400",
    "B+": "text-blue-500",
    B: "text-blue-400",
    "C+": "text-yellow-500",
    C: "text-yellow-400",
    D: "text-orange-500",
    F: "text-red-500",
  };
  return gradeColors[grade] || "text-gray-500";
}
