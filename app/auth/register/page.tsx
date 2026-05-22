// app/auth/register/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Register page ab zaroori nahi
// Seedha login page pe bhejo
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-examind-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}