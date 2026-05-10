// hooks/useToast.ts
"use client";
import { toast } from "sonner";

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (id?: string | number) => toast.dismiss(id),
  };
}

// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// hooks/useDebounce.ts
import { useCallback, useRef } from "react";

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

// hooks/usePDF.ts - Client-side PDF generation
export async function generatePDF(
  htmlContent: string,
  filename: string
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: html2canvas } = await import("html2canvas");

  // Create hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for fonts

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pages = iframeDoc.querySelectorAll(".page");
  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i] as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.9);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }

  pdf.save(filename);
  document.body.removeChild(iframe);
}
