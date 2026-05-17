// app/auth/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, Eye, EyeOff, User, Chrome, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { registerWithEmail, loginWithGoogle, logout } from "@/firebase/auth";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const user = await registerWithEmail(email, password, name);
      if (user && !user.emailVerified) {
        toast.success(
          "Account created! Verification email sent. Please verify your email before signing in."
        );
        await logout();
        router.push("/auth/login");
        return;
      }
      toast.success("Account created! Welcome to ExamMind AI 🎉");
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string };
      const msg =
        err.code === "auth/email-already-in-use"
          ? "Email already in use. Please sign in."
          : err.code === "auth/weak-password"
          ? "Password is too weak"
          : "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Account created! Welcome 🎉");
      router.push("/dashboard");
    } catch {
      toast.error("Google sign up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-examind-800 to-examind-900 relative overflow-hidden items-center justify-center">
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
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Free Trial
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join 50,000+ students who score higher with ExamMind AI
            </p>

            {/* Trial Benefits */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold">Your 2-Day Free Trial Includes:</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Syllabus Analyzer — extract key topics",
                  "AI Notes Generator — all formats",
                  "AI Chatbot — unlimited questions",
                  "Basic PYQ Analysis",
                  "Study Planning assistance",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-white/80 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/60 text-xs">
                  Free for 2 days. No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">Start your 2-day free trial today</p>
          </div>

          {/* Google Signup */}
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
              or create account with email
            </span>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                "Create Free Account"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-examind-600 hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-examind-600 hover:underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-examind-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
