// app/dashboard/pyq/page.tsx
"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Upload, Sparkles, CheckCircle,
  AlertTriangle, BarChart3, Target, Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { saveUpload, savePrediction, incrementUserProfileField } from "@/firebase/firestore";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getProbabilityColor } from "@/utils";

interface PYQAnalysis {
  repeatedQuestions: Array<{ question: string; frequency: number; probability: number }>;
  importantTopics: Array<{ topic: string; weightage: number }>;
  predictions: Array<{ question: string; probability: number; reasoning: string }>;
  trends: string[];
}

export default function PYQPage() {
  const { user, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState<PYQAnalysis | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.type.startsWith("text/")) {
      toast.error("Please upload PDF or TXT file");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setFile(selected);
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!file || !user) {
      toast.error("Please select a file");
      return;
    }
    try {
      setLoading(true);
      setUploadProgress(10);

      const extractedText = await file.text();
      setUploadProgress(30);

      if (!extractedText || extractedText.trim().length < 10) {
        toast.error("File appears empty or unreadable");
        setLoading(false);
        return;
      }

      setUploadProgress(50);

      const response = await fetch("/api/ai/analyze-pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractedText.slice(0, 3000),
          subject: subject || "General",
          uid: user.uid,
        }),
      });

      const data = await response.json();
      console.log("PYQ API Response:", data);

      if (!response.ok) {
        throw new Error(data?.error || "PYQ analysis failed");
      }

      setUploadProgress(80);

      // ✅ Safe data extraction
      const safeAnalysis: PYQAnalysis = {
        repeatedQuestions: Array.isArray(data?.repeatedQuestions) ? data.repeatedQuestions : [],
        importantTopics: Array.isArray(data?.importantTopics) ? data.importantTopics : [],
        predictions: Array.isArray(data?.predictions) ? data.predictions : [],
        trends: Array.isArray(data?.trends) ? data.trends : [],
      };

      await saveUpload(user.uid, {
        type: "pyq",
        fileName: file.name,
        fileUrl: "",
        subject: subject || "General",
        analysis: JSON.parse(JSON.stringify(safeAnalysis)),
      });

      await savePrediction(user.uid, {
        type: "pyq",
        subject: subject || "General",
        ...safeAnalysis,
      });

      await incrementUserProfileField(user.uid, "aiUsageCount", 1);
      await refreshProfile();
      setUploadProgress(100);
      setAnalysis(safeAnalysis);
      toast.success("PYQ analysis complete! 🎉");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const topicChartData = analysis?.importantTopics?.slice(0, 8).map((t) => ({
    topic: t.topic.length > 15 ? t.topic.slice(0, 15) + "..." : t.topic,
    weightage: t.weightage,
  })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Upload Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">PYQ Prediction Engine</h2>
            <p className="text-sm text-muted-foreground">Upload previous year papers to predict exam questions</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Subject</label>
          <input type="text" placeholder="e.g. Mathematics, Operating Systems"
            value={subject} onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500" />
        </div>

        <div onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped) {
              const mockEvent = { target: { files: [dropped] } } as unknown as React.ChangeEvent<HTMLInputElement>;
              handleFileSelect(mockEvent);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            file ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-border hover:border-blue-400 hover:bg-muted/30"
          }`}>
          <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileSelect} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Upload PYQ Papers</p>
              <p className="text-sm text-muted-foreground">PDF or TXT — combine multiple years for better predictions</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {uploadProgress < 35 ? "Reading file..." : uploadProgress < 60 ? "Analyzing patterns..." : uploadProgress < 90 ? "Generating predictions..." : "Done!"}
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button onClick={handleAnalyze} disabled={!file || loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing PYQ...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />Analyze & Predict Questions
            </div>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Trends */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-blue-500" />Detected Trends
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.trends.length > 0 ? (
                  analysis.trends.map((trend, i) => (
                    <Badge key={i} className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 text-xs">
                      {trend}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No trends detected</p>
                )}
              </div>
            </div>

            {/* Chart + Repeated Questions */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Topic Frequency Analysis</h3>
                {topicChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topicChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                      <Bar dataKey="weightage" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No topic data available</p>
                )}
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Repeat className="w-4 h-4 text-blue-500" />Repeated Questions
                </h3>
                {analysis.repeatedQuestions.length > 0 ? (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {analysis.repeatedQuestions.map((q, i) => (
                      <div key={i} className="border border-border rounded-xl p-3">
                        <p className="text-sm mb-2">{q.question}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Appeared {q.frequency}× in papers</span>
                          <span className={`text-xs font-bold ${getProbabilityColor(q.probability)}`}>{q.probability}% likely</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${q.probability}%`,
                            background: q.probability >= 80 ? "#22c55e" : q.probability >= 60 ? "#f59e0b" : "#ef4444"
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No repeated questions found</p>
                )}
              </div>
            </div>

            {/* Predicted Questions */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-blue-500" />🎯 Predicted Questions
              </h3>
              {analysis.predictions.length > 0 ? (
                <div className="space-y-4">
                  {analysis.predictions.map((pred, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border border-border rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                            <p className="font-medium text-sm">{pred.question}</p>
                          </div>
                          <p className="text-xs text-muted-foreground pl-8">{pred.reasoning}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-lg font-bold ${getProbabilityColor(pred.probability)}`}>{pred.probability}%</div>
                          <div className="text-xs text-muted-foreground">probability</div>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-2 ml-8 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${pred.probability}%`,
                          background: pred.probability >= 80 ? "#22c55e" : pred.probability >= 60 ? "#f59e0b" : "#ef4444"
                        }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No predictions available</p>
              )}
            </div>

            {/* Warning */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Predictions are based on historical patterns. Upload more years for higher accuracy. Always cover the full syllabus!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}