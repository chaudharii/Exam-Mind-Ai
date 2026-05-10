// app/dashboard/predictor/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { savePrediction } from "@/firebase/firestore";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { getGradeColor, getProbabilityColor } from "@/utils";

interface Prediction {
  passProbability: number;
  predictedMarks: number;
  grade: string;
  weakSubjects: string[];
  strengths: string[];
  recommendations: string[];
  breakdown: Array<{ factor: string; score: number; impact: string }>;
}

export default function PredictorPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(75);
  const [internalMarks, setInternalMarks] = useState(60);
  const [studyHours, setStudyHours] = useState(4);
  const [syllabusCompletion, setSyllabusCompletion] = useState(60);
  const [subjects, setSubjects] = useState<string[]>(["Mathematics", "Physics"]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const addSubject = () => { if (subjects.length < 6) setSubjects([...subjects, ""]); };
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, val: string) => {
    const upd = [...subjects]; upd[i] = val; setSubjects(upd);
  };

  const handlePredict = async () => {
    const validSubs = subjects.filter(Boolean);
    if (validSubs.length === 0) { toast.error("Add at least one subject"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/predict-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendance, internalMarks, studyHours, syllabusCompletion, subjects: validSubs, uid: user?.uid }),
      });
      if (!res.ok) throw new Error();
      const result: Prediction = await res.json();
      setPrediction(result);
      if (user) await savePrediction(user.uid, { type: "performance", ...result });
      toast.success("Performance predicted!");
    } catch {
      toast.error("Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const radarData = prediction?.breakdown.map((b) => ({ factor: b.factor, score: b.score })) || [];

  const sliders = [
    { label: "Attendance", value: attendance, setter: setAttendance, unit: "%", min: 0, max: 100, color: "bg-blue-500" },
    { label: "Internal Marks", value: internalMarks, setter: setInternalMarks, unit: "/100", min: 0, max: 100, color: "bg-emerald-500" },
    { label: "Daily Study Hours", value: studyHours, setter: setStudyHours, unit: "h", min: 0, max: 12, color: "bg-purple-500" },
    { label: "Syllabus Completion", value: syllabusCompletion, setter: setSyllabusCompletion, unit: "%", min: 0, max: 100, color: "bg-amber-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Performance Predictor</h2>
            <p className="text-sm text-muted-foreground">AI predicts your exam performance based on your inputs</p>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {sliders.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">{s.label}</label>
                <span className={`text-sm font-bold ${s.color.replace("bg-", "text-")}`}>{s.value}{s.unit}</span>
              </div>
              <input type="range" min={s.min} max={s.max} value={s.value}
                onChange={(e) => s.setter(Number(e.target.value))}
                className={`w-full accent-examind-600`} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Subjects</label>
            <button onClick={addSubject} disabled={subjects.length >= 6}
              className="flex items-center gap-1 text-xs text-examind-600 hover:underline disabled:opacity-40">
              <Plus className="w-3 h-3" />Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s, i) => (
              <div key={i} className="flex items-center gap-1 bg-muted/50 border border-border rounded-lg pl-3 pr-1 py-1">
                <input type="text" placeholder={`Subject ${i + 1}`} value={s}
                  onChange={(e) => updateSubject(i, e.target.value)}
                  className="bg-transparent text-sm w-32 focus:outline-none" />
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)} className="p-0.5 text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handlePredict} disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Predicting...
            </div>
          ) : (
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Predict My Performance</div>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {prediction && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Score Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 text-center">
                <div className={`text-4xl font-bold mb-1 ${getProbabilityColor(prediction.passProbability)}`}>
                  {prediction.passProbability}%
                </div>
                <p className="text-sm text-muted-foreground">Pass Probability</p>
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{
                    width: `${prediction.passProbability}%`,
                    background: prediction.passProbability >= 70 ? "#22c55e" : prediction.passProbability >= 50 ? "#f59e0b" : "#ef4444"
                  }} />
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 text-center">
                <div className="text-4xl font-bold mb-1 text-blue-500">{prediction.predictedMarks}</div>
                <p className="text-sm text-muted-foreground">Predicted Marks</p>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 text-center">
                <div className={`text-4xl font-bold mb-1 ${getGradeColor(prediction.grade)}`}>{prediction.grade}</div>
                <p className="text-sm text-muted-foreground">Predicted Grade</p>
              </div>
            </div>

            {/* Radar + Breakdown */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Radar Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Performance Breakdown</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11 }} />
                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prediction.strengths.map((s) => (
                      <Badge key={s} className="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />Weak Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prediction.weakSubjects.map((s) => (
                      <Badge key={s} className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-500" />Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-examind-500 shrink-0 mt-0.5">→</span>{rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Factor Analysis</h3>
              <div className="space-y-3">
                {prediction.breakdown.map((b, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{b.factor}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{b.impact} impact</Badge>
                        <span className="text-sm font-bold">{b.score}/100</span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${b.score}%`, background: b.score >= 70 ? "#22c55e" : b.score >= 50 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
