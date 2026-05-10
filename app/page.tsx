// app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  PenTool,
  TrendingUp,
  MessageSquare,
  Calendar,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "Syllabus Analyzer",
    description: "Upload your syllabus and get instant AI analysis with topic weightage and key areas.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: TrendingUp,
    title: "PYQ Predictions",
    description: "Analyze previous year papers to predict most likely exam questions with probability scores.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: BookOpen,
    title: "AI Notes Generator",
    description: "Generate short notes, long notes, revision points, formulas & definitions instantly.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: PenTool,
    title: "Handwritten Assignments",
    description: "Convert AI answers into beautiful handwritten-style PDFs with ruled notebook paper.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot",
    description: "ChatGPT-style assistant to explain concepts, solve doubts, and simplify topics.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Calendar,
    title: "Study Planner",
    description: "AI-generated daily study plans based on your exam date and preparation level.",
    color: "from-indigo-500 to-blue-600",
  },
];

const stats = [
  { value: "50K+", label: "Students" },
  { value: "98%", label: "Pass Rate" },
  { value: "10M+", label: "Notes Generated" },
  { value: "4.9★", label: "App Rating" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    college: "IIT Delhi",
    text: "ExamMind AI helped me predict 8 out of 10 exam questions correctly! The PYQ analysis is insane.",
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    college: "NIT Trichy",
    text: "The handwritten assignment generator saved me hours. Professors can't even tell it's AI-generated!",
    avatar: "RV",
  },
  {
    name: "Anjali Patel",
    college: "VIT Vellore",
    text: "Study planner is a game changer. I went from failing to scoring 85% in just one semester.",
    avatar: "AP",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">ExamMind AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-examind-600 hover:bg-examind-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-examind-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 left-20 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-examind-50 text-examind-700 dark:bg-examind-950 dark:text-examind-300 border-examind-200 dark:border-examind-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Student OS
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Study Smarter,{" "}
            <span className="gradient-text">Score Higher</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            ExamMind AI analyzes your syllabus, predicts exam questions, generates
            AI notes, creates handwritten assignments, and plans your entire study
            schedule — all powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-examind-600 hover:bg-examind-700 text-white h-12 px-8 text-base glow-primary"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Free — 2 Days Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                View Demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            <Shield className="w-3 h-3 inline mr-1" />
            Free for 2 days. Continue only if you like it. Cancel anytime.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete AI toolkit designed specifically for students to maximize exam performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="feature-card group relative bg-card border border-border rounded-2xl p-6 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Trial */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="badge-trial mb-4">Free Trial</div>
              <div className="text-4xl font-bold mb-1">₹0</div>
              <div className="text-muted-foreground text-sm mb-6">For 2 days</div>
              <ul className="space-y-3 mb-8">
                {["5 AI requests/day", "Syllabus Analyzer", "Basic Notes", "AI Chatbot (limited)"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">Get Started Free</Button>
              </Link>
            </div>

            {/* Pro Monthly */}
            <div className="bg-card border-2 border-examind-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-examind-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="badge-pro mb-4">Pro Monthly</div>
              <div className="text-4xl font-bold mb-1">₹299</div>
              <div className="text-muted-foreground text-sm mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited AI requests",
                  "All features unlocked",
                  "Handwritten Assignments",
                  "PYQ Predictions",
                  "Study Planner",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-examind-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button className="w-full bg-examind-600 hover:bg-examind-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Pro Yearly */}
            <div className="bg-card border border-border rounded-2xl p-8">
              <div className="badge-pro mb-4">Pro Yearly</div>
              <div className="text-4xl font-bold mb-1">₹1,999</div>
              <div className="text-muted-foreground text-sm mb-1">per year</div>
              <div className="text-green-500 text-xs font-semibold mb-6">Save ₹1,589!</div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro Monthly",
                  "2 months free",
                  "Advanced analytics",
                  "Export all as PDF",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">Get Best Value</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Students Across India</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-examind-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.college}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-examind-600 to-purple-700 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Join 50,000+ students already using ExamMind AI
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-examind-700 hover:bg-white/90 h-12 px-8 text-base font-semibold">
                  Start Your Free Trial Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-white/60 text-sm mt-4">No credit card required • 2 days free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">ExamMind AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ExamMind AI. Built with ❤️ for students.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
