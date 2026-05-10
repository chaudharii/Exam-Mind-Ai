// app/not-found.tsx
import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center mb-6">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Oops! This page doesn't exist. Let's get you back to studying.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button className="bg-examind-600 hover:bg-examind-700 text-white">Go to Dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>
      </div>
    </div>
  );
}
