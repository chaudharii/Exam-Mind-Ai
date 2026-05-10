// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/firebase/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter your email"); return; }
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success("Reset email sent!");
    } catch {
      toast.error("Failed to send reset email. Check the address and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">ExamMind AI</span>
        </div>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
            <p className="text-muted-foreground mb-8 text-sm">
              Enter your email and we'll send you a reset link.
            </p>
            <form onSubmit={handleReset} className="space-y-4">
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-examind-600 hover:bg-examind-700 text-white h-11"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check spam or{" "}
              <button onClick={() => setSent(false)} className="text-examind-600 hover:underline">try again</button>
            </p>
          </div>
        )}

        <Link href="/auth/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
