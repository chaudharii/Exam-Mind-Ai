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
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/lib/auth-context";

import {
  saveUpload,
  incrementUserProfileField,
} from "@/firebase/firestore";

import { toast } from "sonner";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  "#3b82f6",
];

interface SyllabusAnalysis {
  units: Array<{
    name: string;
    topics: string[];
    weightage: number;
  }>;

  summary: string;

  importantTopics: string[];

  totalTopics: number;
}

export default function SyllabusAnalyzerPage() {
  const { user, refreshProfile } =
    useAuth();

  const fileRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [analysis, setAnalysis] =
    useState<SyllabusAnalysis | null>(
      null
    );

  const [expandedUnit, setExpandedUnit] =
    useState<number | null>(null);

  const [subject, setSubject] =
    useState("");

  // =====================================
  // FILE SELECT
  // =====================================

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected =
      e.target.files?.[0];

    if (!selected) return;

    if (
      selected.type !==
        "application/pdf" &&
      !selected.type.startsWith("text/")
    ) {
      toast.error(
        "Please upload PDF or TXT file"
      );

      return;
    }

    if (
      selected.size >
      10 * 1024 * 1024
    ) {
      toast.error(
        "File size must be under 10MB"
      );

      return;
    }

    setFile(selected);

    setAnalysis(null);
  };

  // =====================================
  // DRAG DROP
  // =====================================

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault();

    const dropped =
      e.dataTransfer.files[0];

    if (!dropped) return;

    const mockEvent = {
      target: {
        files: [dropped],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleFileSelect(mockEvent);
  };

  // =====================================
  // ANALYZE
  // =====================================

  const handleAnalyze = async () => {
    if (!file || !user) {
      toast.error(
        "Please select a file"
      );

      return;
    }

    try {
      setLoading(true);

      setProgress(10);

      const text = await file.text();

      setProgress(40);

      if (
        !text ||
        text.trim().length < 10
      ) {
        toast.error(
          "File appears empty"
        );

        setLoading(false);

        return;
      }

      setProgress(60);

      const response = await fetch(
        "/api/ai/analyze-syllabus",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            text: text.slice(
              0,
              5000
            ),

            subject:
              subject || "General",

            uid: user.uid,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "API RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Analysis failed"
        );
      }

      setProgress(80);

      // =====================================
      // SAFE ANALYSIS
      // =====================================

      const analysisData: SyllabusAnalysis =
        {
          units:
            data?.result?.units ||
            [],

          summary:
            data?.result
              ?.summary ||
            "No summary available",

          importantTopics:
            data?.result
              ?.importantTopics ||
            [],

          totalTopics:
            data?.result
              ?.totalTopics || 0,
        };

      setAnalysis(analysisData);

      // =====================================
      // SAVE
      // =====================================

      await saveUpload(user.uid, {
  type: "syllabus",
  fileName: file.name,
  fileUrl: "",
  subject: subject || "General",

  analysis: JSON.parse(
    JSON.stringify(analysisData)
  ),
});

      // =====================================
      // UPDATE USER
      // =====================================

      await incrementUserProfileField(
        user.uid,
        "aiUsageCount",
        1
      );

      await refreshProfile();

      setProgress(100);

      toast.success(
        "Syllabus analyzed successfully 🎉"
      );
    } catch (err) {

const errorMsg =
err instanceof Error
? err.message
: "Unknown error";

if(
errorMsg.includes(
"TODAY_LIMIT_OVER"
)
){

toast.error(
"Today's AI limit finished 😭 Try tomorrow"
);

return;

}

toast.error(
errorMsg
);

} finally {
      setLoading(false);
    }
  };

  // =====================================
  // CHART DATA
  // =====================================

  const chartData =
    analysis?.units?.map(
      (unit: any) => ({
        name:
          unit?.name?.length > 20
            ? unit.name.substring(
                0,
                20
              ) + "..."
            : unit?.name ||
              "Unit",

        value:
          unit?.weightage || 0,
      })
    ) || [];

  // =====================================
  // UI
  // =====================================

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Upload Card */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Syllabus Analyzer
            </h2>

            <p className="text-sm text-muted-foreground">
              Upload syllabus for AI
              analysis
            </p>
          </div>
        </div>

        {/* Subject */}

        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            Subject Name
          </label>

          <input
            type="text"
            placeholder="e.g. Mathematics"
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm"
          />
        </div>

        {/* Upload */}

        <div
          onDrop={handleDrop}
          onDragOver={(e) =>
            e.preventDefault()
          }
          onClick={() =>
            fileRef.current?.click()
          }
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            file
              ? "border-examind-500 bg-examind-50/50"
              : "border-border hover:border-examind-400"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={
              handleFileSelect
            }
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />

              <div>
                <p className="font-medium text-sm">
                  {file.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {(
                    file.size /
                    1024
                  ).toFixed(1)}{" "}
                  KB
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />

              <p className="font-medium">
                Upload PDF or TXT
              </p>

              <p className="text-sm text-muted-foreground">
                Max 10MB
              </p>
            </div>
          )}
        </div>

        {/* Progress */}

        {loading && (
          <div className="mt-4">
            <Progress
              value={progress}
              className="h-2"
            />

            <p className="text-sm mt-2 text-muted-foreground">
              {progress}%
              Processing...
            </p>
          </div>
        )}

        {/* Button */}

        <Button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-4 w-full"
        >
          {loading ? (
            "Analyzing..."
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </div>
          )}
        </Button>
      </motion.div>

      {/* RESULTS */}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="space-y-4"
          >
            {/* Summary */}

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary
                </h3>

                <Badge variant="secondary">
                  {
                    analysis?.totalTopics
                  }{" "}
                  Topics
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {analysis?.summary}
              </p>

              {/* Important */}

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">
                  Important Topics
                </p>

                <div className="flex flex-wrap gap-2">
                  {analysis?.importantTopics?.map(
                    (
                      topic: string
                    ) => (
                      <Badge
                        key={topic}
                      >
                        {topic}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Chart */}

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">
                Weightage Chart
              </h3>

              <ResponsiveContainer
                width="100%"
                height={250}
              >
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
                    {chartData.map(
                      (
                        _: any,
                        index: number
                      ) => (
                        <Cell
                          key={index}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Units */}

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">
                Units Breakdown
              </h3>

              <div className="space-y-3">
                {analysis?.units?.map(
                  (
                    unit,
                    i
                  ) => (
                    <div
                      key={i}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedUnit(
                            expandedUnit ===
                              i
                              ? null
                              : i
                          )
                        }
                        className="w-full flex items-center gap-3 p-3"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background:
                              COLORS[
                                i %
                                  COLORS.length
                              ],
                          }}
                        />

                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">
                            {
                              unit?.name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              unit?.weightage
                            }
                            %
                          </p>
                        </div>

                        {expandedUnit ===
                        i ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedUnit ===
                          i && (
                          <motion.div
                            initial={{
                              height: 0,
                            }}
                            animate={{
                              height:
                                "auto",
                            }}
                            exit={{
                              height: 0,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 border-t border-border">
                              <div className="flex flex-wrap gap-2 pt-3">
                                {unit?.topics?.map(
                                  (
                                    topic: string
                                  ) => (
                                    <span
                                      key={
                                        topic
                                      }
                                      className="text-xs border border-border px-2 py-1 rounded-lg"
                                    >
                                      {
                                        topic
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Alert */}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

              <p className="text-sm text-amber-700">
                Focus more on
                high-weightage
                topics for better
                exam preparation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}