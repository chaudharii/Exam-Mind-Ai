// app/dashboard/syllabus/page.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Brain,
  ChevronDown,
  ChevronUp,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { saveUpload } from "@/firebase/firestore";
import { uploadSyllabus } from "@/firebase/storage";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#3b82f6"];

interface SyllabusAnalysis {
  units: Array<{ name: string; topics: string[]; weightage: number }>;
  summary: string;
  importantTopics: string[];
  totalTopics: number;
}

export default function SyllabusAnalyzerPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<SyllabusAnalysis | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<number | null>(null);
  const [subject, setSubject] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.type.startsWith("text/")) {
      toast.error("Please upload a PDF or text file");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setFile(selected);
    setAnalysis(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const mockEvent = { target: { files: [dropped] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(mockEvent);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !user) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      // Read file text
      const text = await file.text();
      setProgress(30);

      // Upload to Firebase Storage
      let fileUrl = "";
      try {
        fileUrl = await uploadSyllabus(user.uid, file);
      } catch {
        console.warn("Storage upload failed, continuing with analysis");
      }
      setProgress(50);

      // Call AI analysis API
      const response = await fetch("/api/ai/analyze-syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          subject: subject || "General",
          uid: user.uid,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");
      const result = await response.json();
      setProgress(80);

      // Save to Firestore
      await saveUpload(user.uid, {
        type: "syllabus",
        fileName: file.name,
        fileUrl,
        analysis: result,
        subject: subject || "General",
      });
      setProgress(100);

      setAnalysis(result);
      toast.success("Syllabus analyzed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = analysis?.units.map((unit) => ({
    name: unit.name.length > 20 ? unit.name.substring(0, 20) + "..." : unit.name,
    value: unit.weightage,
  })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Syllabus Analyzer</h2>
            <p className="text-sm text-muted-foreground">Upload your syllabus PDF for AI analysis</p>
          </div>
        </div>

        {/* Subject Input */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Subject Name (optional)</label>
          <input
            type="text"
            placeholder="e.g., Data Structures, Mathematics, Physics"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500"
          />
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            file
              ? "border-examind-500 bg-examind-50/50 dark:bg-examind-950/20"
              : "border-border hover:border-examind-400 hover:bg-muted/30"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-examind-500" />
              <div className="text-left">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-1">Drop your syllabus PDF here</p>
              <p className="text-sm text-muted-foreground">or click to browse • PDF, TXT up to 10MB</p>
            </div>
          )}
        </div>

        {/* Loading Progress */}
        {loading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {progress < 30 ? "Reading file..." : progress < 60 ? "Processing with AI..." : progress < 90 ? "Generating analysis..." : "Saving..."}
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-4 w-full bg-examind-600 hover:bg-examind-700 text-white h-11"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </div>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-examind-500" />
                  Syllabus Summary
                </h3>
                <Badge variant="secondary">{analysis.totalTopics} Topics</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>

              {/* Important Topics */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">🔥 Important Topics</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.importantTopics.map((topic) => (
                    <Badge key={topic} className="bg-examind-50 text-examind-700 dark:bg-examind-950 dark:text-examind-300 border-examind-200">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart + Units */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Weightage Chart */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Topic Weightage Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Weightage"]}
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Units List */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Units Breakdown</h3>
                <div className="space-y-3">
                  {analysis.units.map((unit, i) => (
                    <div key={i} className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedUnit(expandedUnit === i ? null : i)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{unit.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 progress-bar h-1.5">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${unit.weightage}%`,
                                  background: COLORS[i % COLORS.length],
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{unit.weightage}%</span>
                          </div>
                        </div>
                        {expandedUnit === i ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedUnit === i && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 border-t border-border bg-muted/30">
                              <p className="text-xs font-medium text-muted-foreground mb-2 pt-2">Topics:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {unit.topics.map((topic) => (
                                  <span key={topic} className="text-xs bg-background border border-border px-2 py-0.5 rounded-lg">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <strong>Pro tip:</strong> Topics with higher weightage are more likely to appear in exams.
                Focus your revision on high-weightage units first, then cover the rest.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
