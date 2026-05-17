// app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, Eye, EyeOff, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginWithEmail, loginWithGoogle, logout } from "@/firebase/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const user = await loginWithEmail(email, password);

      // Email verification check
      if (!user.emailVerified) {
        await logout();
        toast.error("Please verify your email first! Check your inbox 📧", {
          duration: 5000,
          action: {
            label: "Resend Email",
            onClick: async () => {
              toast.info("Please register again to get a new verification email.");
            },
          },
        });
        setLoading(false);
        return;
      }

      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string };
      const msg =
        err.code === "auth/email-not-verified"
          ? "Please verify your email first! Check inbox 📧"
          : err.code === "auth/user-not-found"
          ? "No account found with this email"
          : err.code === "auth/wrong-password"
          ? "Incorrect password"
          : err.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : err.code === "auth/too-many-requests"
          ? "Too many attempts! Try again later"
          : "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
    } catch {
      toast.error("Google login failed. Please try again.");
    } finally {
      setGoogleLoading(false);
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
            <h2 className="text-4xl font-bold text-white mb-4">ExamMind AI</h2>
            <p className="text-white/70 text-lg max-w-md">
              Your AI-powered study companion. Analyze syllabi, predict questions,
              generate notes, and ace your exams.
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
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">ExamMind AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to continue your studies
            </p>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 mb-4 gap-2"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Chrome className="w-4 h-4" />
            )}
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-3 text-xs text-muted-foreground">
              or sign in with email
            </span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-examind-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-examind-600 hover:bg-examind-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-examind-600 hover:underline font-medium"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}