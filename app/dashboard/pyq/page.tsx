"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Repeat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { useAuth } from "@/lib/auth-context";

import {
  saveUpload,
  savePrediction,
  incrementUserProfileField,
} from "@/firebase/firestore";

import { uploadPYQ } from "@/firebase/storage";

import { toast } from "sonner";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getProbabilityColor } from "@/utils";

interface PYQAnalysis {
  repeatedQuestions: Array<{
    question: string;
    frequency: number;
    probability: number;
  }>;

  importantTopics: Array<{
    topic: string;
    weightage: number;
  }>;

  predictions: Array<{
    question: string;
    probability: number;
    reasoning: string;
  }>;

  trends: string[];
}

export default function PYQPage() {
  const { user, refreshProfile } = useAuth();

  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  const [subject, setSubject] = useState("");

  const [loading, setLoading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [analysis, setAnalysis] =
    useState<PYQAnalysis | null>(null);

  // =========================
  // FILE SELECT
  // =========================
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.type.startsWith("text/")
    ) {
      toast.error(
        "Please upload PDF or TXT file"
      );
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error(
        "File size must be under 10MB"
      );
      return;
    }

    setFile(selected);
    setAnalysis(null);
  };

  // =========================
  // ANALYZE
  // =========================
  const handleAnalyze = async () => {
    if (!file || !user) {
      toast.error("Please select a file");
      return;
    }

    try {
      setLoading(true);

      setUploadProgress(10);

      // =========================
      // READ FILE TEXT
      // =========================
      let extractedText = "";

      try {
        extractedText = await file.text();
      } catch {
        extractedText = "";
      }

      setUploadProgress(30);

      if (
        !extractedText ||
        extractedText.trim().length < 10
      ) {
        toast.error(
          "File appears empty or unreadable"
        );

        setLoading(false);

        return;
      }

      // =========================
      // OPTIONAL STORAGE
      // =========================
      // =========================
// SKIP STORAGE FOR SPEED
// =========================

let fileUrl = "";
// FIREBASE STORAGE DISABLED
console.log(
"Skipping storage upload"
);

setUploadProgress(50);

      // =========================
      // API REQUEST
      // =========================
      const response = await fetch(
        "/api/ai/analyze-pyq",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            text: extractedText.slice(
              0,
              1200
            ),

            subject:
              subject || "General",

            uid: user.uid,
          }),
        }
      );

      // =========================
      // HANDLE API ERROR
      // =========================
      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.error ||
            "PYQ analysis failed"
        );
      }

      setUploadProgress(80);

      // =========================
      // RESPONSE
      // =========================
      const analysisData =
        await response.json();

      const safeAnalysis: PYQAnalysis = {
        repeatedQuestions:
          analysisData.repeatedQuestions ||
          [],

        importantTopics:
          analysisData.importantTopics ||
          [],

        predictions:
          analysisData.predictions || [],

        trends:
          analysisData.trends || [],
      };

      // =========================
      // SAVE FIREBASE
      // =========================
      await saveUpload(user.uid, {
  type: "pyq",

  fileName: file.name,

  fileUrl,

  subject: subject || "General",

  analysis: JSON.parse(
    JSON.stringify(safeAnalysis)
  ),
});

      await savePrediction(user.uid, {
        type: "pyq",

        subject:
          subject || "General",

        ...safeAnalysis,
      });

      await incrementUserProfileField(
        user.uid,
        "aiUsageCount",
        1
      );

      await refreshProfile();

      setUploadProgress(100);

      setAnalysis(safeAnalysis);

      toast.success(
        "PYQ analysis complete!"
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

  // =========================
  // CHART DATA
  // =========================
  const topicChartData =
    analysis?.importantTopics
      ?.slice(0, 8)
      .map((t) => ({
        topic:
          t.topic.length > 15
            ? t.topic.slice(0, 15) + "..."
            : t.topic,

        weightage: t.weightage,
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              PYQ Prediction Engine
            </h2>

            <p className="text-sm text-muted-foreground">
              Upload previous year papers
            </p>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            Subject
          </label>

          <input
            type="text"
            placeholder="e.g. Mathematics"
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm"
          />
        </div>

        {/* Upload */}
        <div
          onClick={() =>
            fileRef.current?.click()
          }
          onDragOver={(e) =>
            e.preventDefault()
          }
          onDrop={(e) => {
            e.preventDefault();

            const dropped =
              e.dataTransfer.files[0];

            if (dropped) {
              const mockEvent = {
                target: {
                  files: [dropped],
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>;

              handleFileSelect(
                mockEvent
              );
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            file
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
              : "border-border hover:border-blue-400"
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
              <CheckCircle className="w-6 h-6 text-blue-500" />

              <div className="text-left">
                <p className="font-medium text-sm">
                  {file.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {(
                    file.size / 1024
                  ).toFixed(1)}{" "}
                  KB
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />

              <p className="font-medium mb-1">
                Upload PYQ file
              </p>

              <p className="text-sm text-muted-foreground">
                PDF or TXT
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        {loading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Processing...
              </span>

              <span>
                {uploadProgress}%
              </span>
            </div>

            <Progress
              value={uploadProgress}
              className="h-2"
            />
          </div>
        )}

        {/* Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

              Analyzing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />

              Analyze PYQ
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

            {/* Trends */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">
                Trends
              </h3>

              <div className="flex flex-wrap gap-2">
                {analysis.trends.map(
                  (trend, i) => (
                    <Badge key={i}>
                      {trend}
                    </Badge>
                  )
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}