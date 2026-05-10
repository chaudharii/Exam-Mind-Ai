// app/dashboard/notes/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Copy, Download, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { saveNote, getUserNotes } from "@/firebase/firestore";
import { toast } from "sonner";
import { useEffect } from "react";

const NOTE_TYPES = [
  { id: "short", label: "Short Notes", emoji: "📝", desc: "Concise bullet points" },
  { id: "long", label: "Detailed Notes", emoji: "📚", desc: "Comprehensive explanations" },
  { id: "revision", label: "Revision Points", emoji: "🔄", desc: "Quick revision list" },
  { id: "formulas", label: "Formulas", emoji: "🔢", desc: "Key formulas & equations" },
  { id: "definitions", label: "Definitions", emoji: "📖", desc: "Terms & meanings" },
] as const;

type NoteType = typeof NOTE_TYPES[number]["id"];

interface GeneratedNote {
  title: string;
  content: string;
  keyPoints: string[];
  formulas?: string[];
  definitions?: Record<string, string>;
}

interface SavedNote {
  id: string;
  subject: string;
  topic: string;
  type: string;
  content: string;
}

export default function NotesPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("short");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<GeneratedNote | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    if (user) {
      getUserNotes(user.uid).then((notes) => setSavedNotes(notes as SavedNote[]));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!subject || !topic) {
      toast.error("Please enter subject and topic");
      return;
    }

    setLoading(true);
    setSaved(false);

    try {
      const response = await fetch("/api/ai/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, noteType, uid: user?.uid }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const result = await response.json();
      setNote(result);
      toast.success("Notes generated successfully!");
    } catch {
      toast.error("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!note || !user) return;
    try {
      await saveNote(user.uid, {
        subject,
        topic,
        type: noteType,
        content: note.content,
      });
      setSaved(true);
      toast.success("Notes saved to your library!");
      // Refresh saved notes
      const notes = await getUserNotes(user.uid);
      setSavedNotes(notes as SavedNote[]);
    } catch {
      toast.error("Failed to save notes");
    }
  };

  const handleCopy = () => {
    if (!note) return;
    const text = `${note.title}\n\n${note.content}\n\nKey Points:\n${note.keyPoints.map((p) => `• ${p}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!note) return;
    const text = `${note.title}\n${"=".repeat(50)}\n\n${note.content}\n\nKey Points:\n${note.keyPoints.map((p) => `• ${p}`).join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/\s+/g, "_")}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Notes Generator</h2>
            <p className="text-sm text-muted-foreground">Generate comprehensive notes with AI</p>
          </div>
        </div>

        {/* Note Type Selection */}
        <div className="mb-5">
          <label className="text-sm font-medium mb-3 block">Note Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {NOTE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setNoteType(type.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  noteType === type.id
                    ? "border-examind-500 bg-examind-50 dark:bg-examind-950/30"
                    : "border-border hover:border-examind-400 hover:bg-muted/50"
                }`}
              >
                <div className="text-xl mb-1">{type.emoji}</div>
                <div className="text-xs font-medium">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <input
              type="text"
              placeholder="e.g., Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Topic</label>
            <input
              type="text"
              placeholder="e.g., Binary Trees, Sorting Algorithms"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-examind-500"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!subject || !topic || loading}
          className="w-full bg-examind-600 hover:bg-examind-700 text-white h-11"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Notes...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Notes
            </div>
          )}
        </Button>
      </motion.div>

      {/* Generated Notes */}
      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{note.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{subject}</Badge>
                  <Badge variant="secondary" className="text-xs capitalize">{noteType}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saved}
                  className="bg-examind-600 hover:bg-examind-700 text-white gap-1.5"
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? "Saved!" : "Save"}
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Content</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: note.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/^• /gm, "• ")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>

                {/* Formulas */}
                {note.formulas && note.formulas.length > 0 && (
                  <div className="mt-6 bg-muted/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold mb-3">📐 Key Formulas</h4>
                    <div className="space-y-2">
                      {note.formulas.map((formula, i) => (
                        <div key={i} className="bg-background rounded-lg px-3 py-2 font-mono text-sm border border-border">
                          {formula}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Definitions */}
                {note.definitions && Object.keys(note.definitions).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-3">📖 Definitions</h4>
                    <div className="space-y-2">
                      {Object.entries(note.definitions).map(([term, def]) => (
                        <div key={term} className="border border-border rounded-xl p-3">
                          <span className="font-semibold text-examind-600 text-sm">{term}: </span>
                          <span className="text-sm text-muted-foreground">{def}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Points */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Key Points</h4>
                <div className="space-y-2">
                  {note.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-muted/50 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-examind-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Notes Library */}
      {savedNotes.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">📚 Your Notes Library</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedNotes.map((n) => (
              <div key={n.id} className="border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                <Badge variant="secondary" className="text-xs mb-2">{n.subject}</Badge>
                <p className="font-medium text-sm">{n.topic}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">{n.type} notes</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
