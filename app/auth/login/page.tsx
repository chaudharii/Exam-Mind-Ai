// app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithGoogle } from "@/firebase/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
    } catch {
      toast.error("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-examind-900 via-examind-800 to-purple-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 border border-white/20">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              ExamMind AI
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Your AI-powered study companion. Analyze syllabi, predict
              questions, generate notes, and ace your exams.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-4 text-left">
              {[
                { emoji: "🧠", text: "AI Syllabus Analysis" },
                { emoji: "📊", text: "PYQ Predictions" },
                { emoji: "✍️", text: "Handwritten Assignments" },
                { emoji: "📅", text: "Smart Study Planner" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-white/80 text-sm font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md text-center"
        >
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl gradient-text">
              ExamMind AI
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p className="text-muted-foreground mb-8">
            Sign in with Google to continue your studies
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 gap-3 text-base"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Chrome className="w-5 h-5" />
            )}
            Continue with Google
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            By signing in you agree to our Terms and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}