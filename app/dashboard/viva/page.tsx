// app/dashboard/viva/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, ChevronDown, ChevronUp, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { incrementUserProfileField } from "@/firebase/firestore";
import { toast } from "sonner";

interface VivaQuestion {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  followUps: string[];
}

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
};

export default function VivaPage() {
  const { user, refreshProfile } = useAuth();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<VivaQuestion[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !topic) { toast.error("Please enter subject and topic"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/viva-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, uid: user?.uid }),
      });
      if (!res.ok) throw new Error();
      const { questions: qs } = await res.json();
      setQuestions(qs);
      setExpandedIdx(null);
      setPracticeMode(false);
      if (user) {
        await incrementUserProfileField(user.uid, "aiUsageCount", 1);
        await refreshProfile();
      }
      toast.success("Viva questions generated!");
    } catch {
      toast.error("Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => { setPracticeMode(true); setCurrentQ(0); setShowAnswer(false); };
  const nextQ = () => { setCurrentQ((c) => Math.min(c + 1, questions.length - 1)); setShowAnswer(false); };
  const prevQ = () => { setCurrentQ((c) => Math.max(c - 1, 0)); setShowAnswer(false); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Viva Preparation</h2>
            <p className="text-sm text-muted-foreground">AI-generated viva questions with model answers</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <input type="text" placeholder="e.g., Operating Systems"
              value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Topic / Chapter</label>
            <input type="text" placeholder="e.g., Process Scheduling"
              value={topic} onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500" />
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={!subject || !topic || loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white h-11">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating Questions...
            </div>
          ) : (
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" />Generate Viva Questions</div>
          )}
        </Button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{questions.length} questions generated</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPracticeMode(false)}
                  className={!practiceMode ? "border-examind-500 text-examind-600" : ""}>
                  <HelpCircle className="w-3.5 h-3.5 mr-1.5" />Study Mode
                </Button>
                <Button variant="outline" size="sm" onClick={startPractice}
                  className={practiceMode ? "border-examind-500 text-examind-600" : ""}>
                  <Mic className="w-3.5 h-3.5 mr-1.5" />Practice Mode
                </Button>
              </div>
            </div>

            {/* Practice Mode */}
            {practiceMode ? (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="text-xs text-muted-foreground mb-2">Question {currentQ + 1} of {questions.length}</div>
                  <div className="progress-bar h-2 mb-4">
                    <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                  </div>
                  <Badge className={difficultyColor[questions[currentQ].difficulty]}>
                    {questions[currentQ].difficulty.charAt(0).toUpperCase() + questions[currentQ].difficulty.slice(1)}
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded-2xl p-6 mb-6 text-center">
                  <HelpCircle className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                  <p className="text-lg font-medium">{questions[currentQ].question}</p>
                </div>

                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                    Reveal Answer
                  </Button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-2xl p-5 mb-4">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Model Answer:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{questions[currentQ].answer}</p>
                    </div>
                    {questions[currentQ].followUps.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Possible follow-ups:</p>
                        <div className="space-y-1.5">
                          {questions[currentQ].followUps.map((fq, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MessageCircle className="w-3 h-3 shrink-0 mt-0.5 text-pink-400" />
                              {fq}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={prevQ} disabled={currentQ === 0} className="flex-1">← Previous</Button>
                      {currentQ < questions.length - 1 ? (
                        <Button onClick={nextQ} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">Next →</Button>
                      ) : (
                        <Button onClick={() => { setPracticeMode(false); toast.success("Practice complete! 🎉"); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Finish ✓</Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* Study Mode - all questions */
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-950/30 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.question}</p>
                      </div>
                      <Badge className={`${difficultyColor[q.difficulty]} shrink-0 text-xs`}>{q.difficulty}</Badge>
                      {expandedIdx === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </button>

                    <AnimatePresence>
                      {expandedIdx === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 border-t border-border bg-muted/20">
                            <div className="pt-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Answer</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{q.answer}</p>
                              {q.followUps.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-border">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Follow-up Questions</p>
                                  <div className="space-y-1.5">
                                    {q.followUps.map((fq, j) => (
                                      <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <MessageCircle className="w-3 h-3 shrink-0 mt-0.5 text-pink-400" />{fq}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
