// app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ExamMind AI — Your AI-Powered Student OS",
    template: "%s | ExamMind AI",
  },
  description:
    "AI-powered platform for students: syllabus analysis, PYQ predictions, AI notes, handwritten assignments, viva prep, and more.",
  keywords: ["AI study", "exam preparation", "notes generator", "PYQ analysis"],
  authors: [{ name: "ExamMind AI" }],
  openGraph: {
    title: "ExamMind AI",
    description: "Your AI-Powered Student OS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  fontFamily: "var(--font-geist-sans)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
