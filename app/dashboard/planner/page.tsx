// app/dashboard/planner/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Clock, BookOpen, Target, Lightbulb, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { saveStudyPlan } from "@/firebase/firestore";
import { toast } from "sonner";

interface DayTask { subject: string; topic: string; duration: number; type: string; }
interface DayPlan { date: string; day: string; tasks: DayTask[]; totalHours: number; }
interface StudyPlan {
  overview: string;
  dailyPlan: DayPlan[];
  weeklyGoals: string[];
  tips: string[];
}

const PREP_LEVELS = [
  { id: "beginner", label: "Just Started", emoji: "🌱", desc: "Less than 20% covered" },
  { id: "intermediate", label: "Mid Prep", emoji: "📚", desc: "About 50% covered" },
  { id: "advanced", label: "Almost Done", emoji: "🚀", desc: "More than 75% covered" },
];

const taskTypeColor: Record<string, string> = {
  study: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  revision: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  practice: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  rest: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  mock: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
};

export default function PlannerPage() {
  const { user } = useAuth();
  const [examDate, setExamDate] = useState("");
  const [subjects, setSubjects] = useState<string[]>([""]);
  const [prepLevel, setPrepLevel] = useState("intermediate");
  const [dailyHours, setDailyHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  const addSubject = () => { if (subjects.length < 8) setSubjects([...subjects, ""]); };
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, val: string) => {
    const updated = [...subjects]; updated[i] = val; setSubjects(updated);
  };

  const handleGenerate = async () => {
    const validSubjects = subjects.filter(Boolean);
    if (!examDate) { toast.error("Please select exam date"); return; }
    if (validSubjects.length === 0) { toast.error("Please add at least one subject"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDate, subjects: validSubjects, preparationLevel: prepLevel, dailyHours, uid: user?.uid }),
      });
      if (!res.ok) throw new Error();
      const result: StudyPlan = await res.json();
      setPlan(result);

      if (user) {
        await saveStudyPlan(user.uid, { examDate, subjects: validSubjects, preparationLevel: prepLevel, plan: result as unknown as Record<string, unknown> });
      }
      toast.success("Study plan created!");
    } catch {
      toast.error("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  const daysUntilExam = examDate ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Input Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Study Planner</h2>
            <p className="text-sm text-muted-foreground">Generate a personalized daily study schedule</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Exam Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Exam Date</label>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500" />
            {daysUntilExam !== null && daysUntilExam > 0 && (
              <p className={`text-xs mt-1.5 font-medium ${daysUntilExam <= 7 ? "text-red-500" : daysUntilExam <= 14 ? "text-amber-500" : "text-green-500"}`}>
                ⏳ {daysUntilExam} days remaining
              </p>
            )}
          </div>

          {/* Daily Hours */}
          <div>
            <label className="text-sm font-medium mb-2 block">Daily Study Hours: <span className="text-examind-600 font-bold">{dailyHours}h</span></label>
            <input type="range" min={1} max={12} value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-examind-600 mt-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1h</span><span>6h</span><span>12h</span>
            </div>
          </div>
        </div>

        {/* Preparation Level */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-3 block">Current Preparation Level</label>
          <div className="grid grid-cols-3 gap-3">
            {PREP_LEVELS.map((level) => (
              <button key={level.id} onClick={() => setPrepLevel(level.id)}
                className={`p-3 rounded-xl border text-left transition-all ${prepLevel === level.id ? "border-examind-500 bg-examind-50 dark:bg-examind-950/30" : "border-border hover:border-examind-400 hover:bg-muted/50"}`}>
                <div className="text-xl mb-1">{level.emoji}</div>
                <div className="text-xs font-medium">{level.label}</div>
                <div className="text-xs text-muted-foreground">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Subjects to Study</label>
            <button onClick={addSubject} disabled={subjects.length >= 8}
              className="flex items-center gap-1 text-xs text-examind-600 hover:underline disabled:opacity-40">
              <Plus className="w-3.5 h-3.5" />Add Subject
            </button>
          </div>
          <div className="space-y-2">
            {subjects.map((sub, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder={`Subject ${i + 1} (e.g., Mathematics)`}
                  value={sub} onChange={(e) => updateSubject(i, e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500" />
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading || !examDate || subjects.filter(Boolean).length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating Plan...
            </div>
          ) : (
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Generate My Study Plan</div>
          )}
        </Button>
      </motion.div>

      {/* Plan Results */}
      <AnimatePresence>
        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Overview */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-indigo-500" />Study Plan Overview
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.overview}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Weekly Goals</p>
                  <ul className="space-y-1.5">
                    {plan.weeklyGoals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-500 mt-0.5">✓</span>{goal}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    <Lightbulb className="w-3.5 h-3.5 inline mr-1 text-amber-500" />Study Tips
                  </p>
                  <ul className="space-y-1.5">
                    {plan.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500 mt-0.5">💡</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Daily Plan */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-indigo-500" />7-Day Daily Schedule
              </h3>
              <div className="space-y-4">
                {plan.dailyPlan.map((day, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{day.day}</p>
                          <p className="text-xs text-muted-foreground">{day.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />{day.totalHours}h total
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {day.tasks.map((task, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">{task.subject}</span>
                            <span className="text-sm text-muted-foreground"> — {task.topic}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`${taskTypeColor[task.type] || taskTypeColor.study} text-xs`}>{task.type}</Badge>
                            <span className="text-xs text-muted-foreground">{task.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
