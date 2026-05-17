// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Flame,
  Brain,
  FileText,
  TrendingUp,
  BookOpen,
  PenTool,
  Mic,
  Calendar,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { getUserUploads, getUserNotes } from "@/firebase/firestore";
import { updateStudyStreak } from "@/firebase/firestore";
import { daysUntil } from "@/utils";

const quickActions = [
  { href: "/dashboard/syllabus", icon: FileText, label: "Analyze Syllabus", color: "from-violet-500 to-purple-600", desc: "Upload & analyze" },
  { href: "/dashboard/pyq", icon: TrendingUp, label: "PYQ Predictions", color: "from-blue-500 to-cyan-600", desc: "Predict questions" },
  { href: "/dashboard/notes", icon: BookOpen, label: "Generate Notes", color: "from-emerald-500 to-teal-600", desc: "AI-powered notes" },
  { href: "/dashboard/assignments", icon: PenTool, label: "Assignment", color: "from-amber-500 to-orange-600", desc: "Handwritten PDF" },
  { href: "/dashboard/viva", icon: Mic, label: "Viva Prep", color: "from-pink-500 to-rose-600", desc: "Practice questions" },
  { href: "/dashboard/chatbot", icon: MessageSquare, label: "AI Chatbot", color: "from-indigo-500 to-blue-600", desc: "Ask anything" },
];

const weeklyData = [
  { day: "Mon", hours: 3 },
  { day: "Tue", hours: 4.5 },
  { day: "Wed", hours: 2 },
  { day: "Thu", hours: 5 },
  { day: "Fri", hours: 3.5 },
  { day: "Sat", hours: 6 },
  { day: "Sun", hours: 4 },
];

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [uploads, setUploads] = useState<unknown[]>([]);
  const [notes, setNotes] = useState<unknown[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      const [uploadsData, notesData, newStreak] = await Promise.all([
        getUserUploads(user.uid),
        getUserNotes(user.uid),
        updateStudyStreak(user.uid),
      ]);
      setUploads(uploadsData);
      setNotes(notesData);
      setStreak(newStreak);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  const trialDaysLeft = userProfile?.trialEndsAt
    ? Math.max(0, daysUntil(userProfile.trialEndsAt))
    : 0;

  const readinessData = [
    { name: "readiness", value: userProfile?.examReadiness ?? 65, fill: "#6366f1" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span className="gradient-text">{userProfile?.displayName?.split(" ")[0] || "Student"}!</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Ready to level up your studies today?</p>
        </div>
        {userProfile?.plan === "trial" && (
          <div className="hidden sm:block bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-right">
            <p className="text-amber-700 dark:text-amber-400 font-semibold text-sm">
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in trial
            </p>
            <Link href="/dashboard/billing" className="text-amber-600 text-xs hover:underline">
              Upgrade to Pro →
            </Link>
          </div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Flame,
            label: "Study Streak",
            value: `${streak} days`,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950/30",
          },
          {
            icon: FileText,
            label: "Uploads",
            value: uploads.length.toString(),
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/30",
          },
          {
            icon: Brain,
            label: "AI Requests",
            value: `${userProfile?.aiUsageCount || 0}`,
            color: "text-examind-500",
            bg: "bg-examind-50 dark:bg-examind-950/30",
          },
          {
            icon: BookOpen,
            label: "Notes Created",
            value: notes.length.toString(),
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weekly Study Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Weekly Study Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} unit="h" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#studyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Exam Readiness */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Exam Readiness</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={180}
                endAngle={0}
                data={readinessData}
              >
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-3xl font-bold gradient-text">
                {userProfile?.examReadiness ?? 65}%
              </div>
              <div className="text-xs text-muted-foreground">Ready</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: "Syllabus", value: 70 },
              { label: "Practice", value: 55 },
              { label: "Revision", value: 80 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Quick Actions</h3>
          <Sparkles className="w-4 h-4 text-examind-500" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-card border border-border rounded-2xl p-4 hover:border-examind-500/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Uploads */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Uploads</h3>
            <Link href="/dashboard/syllabus" className="text-xs text-examind-500 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {uploads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No uploads yet</p>
              <Link href="/dashboard/syllabus" className="text-xs text-examind-500 hover:underline">
                Upload your first syllabus →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.slice(0, 4).map((upload: unknown) => {
                const u = upload as { id: string; fileName: string; type: string; createdAt?: { seconds?: number } };
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-9 h-9 rounded-lg bg-examind-100 dark:bg-examind-950 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-examind-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.fileName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{u.type}</p>
                    </div>
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Study Tips */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Today's Focus</h3>
            <Target className="w-4 h-4 text-examind-500" />
          </div>
          <div className="space-y-3">
            {[
              {
                icon: Brain,
                title: "Upload your syllabus",
                desc: "Get AI analysis and topic weightage",
                color: "text-violet-500",
                href: "/dashboard/syllabus",
              },
              {
                icon: TrendingUp,
                title: "Analyze PYQ papers",
                desc: "Predict likely exam questions",
                color: "text-blue-500",
                href: "/dashboard/pyq",
              },
              {
                icon: BarChart3,
                title: "Check exam readiness",
                desc: "See your predicted performance",
                color: "text-emerald-500",
                href: "/dashboard/predictor",
              },
              {
                icon: Calendar,
                title: "Create study plan",
                desc: "AI-generated daily schedule",
                color: "text-amber-500",
                href: "/dashboard/planner",
              },
            ].map((tip) => (
              <Link
                key={tip.href}
                href={tip.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                  <tip.icon className={`w-4 h-4 ${tip.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tip.title}</p>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
