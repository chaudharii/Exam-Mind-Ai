// services/ai.ts
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 60000,
  maxRetries: 2,
});

// ======================================================
// RETRY
// ======================================================
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

// ======================================================
// SAFE JSON PARSER
// ======================================================
function safeJsonParse(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {}
    return null;
  }
}

// ======================================================
// SYLLABUS ANALYZER
// ======================================================
export async function analyzeSyllabus(
  syllabusText: string,
  subject: string = "General"
) {
  return withRetry(async () => {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an AI syllabus analyzer. Return ONLY valid JSON, no extra text.",
          },
          {
            role: "user",
            content: `Analyze this syllabus for ${subject}.
Return ONLY this JSON:
{
  "units": [{"name": "Unit Name", "topics": ["Topic 1"], "weightage": 20}],
  "summary": "short summary",
  "importantTopics": ["Topic"],
  "totalTopics": 5
}

Syllabus text:
${syllabusText.slice(0, 2000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      const content = completion.choices?.[0]?.message?.content || "";
      const parsed = safeJsonParse(content);
      if (!parsed) {
        return {
          units: [],
          summary: "Could not analyze syllabus",
          importantTopics: [],
          totalTopics: 0,
        };
      }
      return {
        units: Array.isArray(parsed.units) ? parsed.units : [],
        summary: parsed.summary || "No summary",
        importantTopics: Array.isArray(parsed.importantTopics) ? parsed.importantTopics : [],
        totalTopics: typeof parsed.totalTopics === "number" ? parsed.totalTopics : 0,
      };
    } catch (error) {
      console.error("analyzeSyllabus error:", error);
      return { units: [], summary: "Analysis failed", importantTopics: [], totalTopics: 0 };
    }
  });
}

// ======================================================
// PYQ ANALYZER
// ======================================================
export async function analyzePYQ(
  pyqText: string,
  subject: string = "General"
) {
  return withRetry(async () => {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You analyze previous year question papers. Return ONLY valid JSON, no extra text.",
          },
          {
            role: "user",
            content: `Analyze these ${subject} PYQ papers.
Return ONLY this JSON:
{
  "repeatedQuestions": [{"question": "q", "frequency": 2, "probability": 80}],
  "importantTopics": [{"topic": "t", "weightage": 30}],
  "predictions": [{"question": "q", "probability": 85, "reasoning": "reason"}],
  "trends": ["trend"]
}

PYQ text:
${pyqText.slice(0, 2000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      });

      const content = completion.choices?.[0]?.message?.content || "";
      const parsed = safeJsonParse(content);
      if (!parsed) {
        return { repeatedQuestions: [], importantTopics: [], predictions: [], trends: [] };
      }
      return {
        repeatedQuestions: Array.isArray(parsed.repeatedQuestions) ? parsed.repeatedQuestions : [],
        importantTopics: Array.isArray(parsed.importantTopics) ? parsed.importantTopics : [],
        predictions: Array.isArray(parsed.predictions) ? parsed.predictions : [],
        trends: Array.isArray(parsed.trends) ? parsed.trends : [],
      };
    } catch (error) {
      console.error("analyzePYQ error:", error);
      return { repeatedQuestions: [], importantTopics: [], predictions: [], trends: [] };
    }
  });
}

// ======================================================
// NOTES GENERATOR
// ======================================================
export async function generateNotes(
  topic: string,
  subject: string,
  noteType: string
) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert tutor. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Generate ${noteType} notes for "${topic}" in ${subject}.
Return JSON:
{
  "title": "Title",
  "content": "Detailed notes here",
  "keyPoints": ["Point 1", "Point 2"],
  "formulas": ["Formula 1"],
  "definitions": {"Term": "Definition"}
}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    });
    return safeJsonParse(res.choices?.[0]?.message?.content || "") || {
      title: topic,
      content: "Could not generate notes",
      keyPoints: [],
      formulas: [],
      definitions: {},
    };
  });
}

// ======================================================
// ASSIGNMENT GENERATOR
// ======================================================
export async function generateAssignmentAnswer(
  question: string,
  subject: string
) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You write formal assignment answers. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Write assignment answer for: "${question}" in ${subject}.
Return JSON:
{
  "answer": "Full detailed answer here",
  "wordCount": 400,
  "sections": [
    {"heading": "Introduction", "content": "intro text"},
    {"heading": "Main Body", "content": "main text"},
    {"heading": "Conclusion", "content": "conclusion text"}
  ]
}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1800,
    });
    return safeJsonParse(res.choices?.[0]?.message?.content || "") || {
      answer: "Could not generate answer",
      wordCount: 0,
      sections: [],
    };
  });
}

// ======================================================
// VIVA QUESTIONS
// ======================================================
export async function generateVivaQuestions(
  subject: string,
  topic: string
) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You generate viva questions. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Generate 8 viva questions for "${topic}" in ${subject}.
Return JSON:
{
  "questions": [
    {
      "question": "Question here",
      "answer": "Detailed answer",
      "difficulty": "medium",
      "followUps": ["Follow up question"]
    }
  ]
}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 1800,
    });
    return safeJsonParse(res.choices?.[0]?.message?.content || "") || { questions: [] };
  });
}

// ======================================================
// STUDY PLANNER
// ======================================================
export async function generateStudyPlan(input: {
  examDate: string;
  subjects: string[];
  preparationLevel: string;
  dailyHours: number;
}) {
  const daysLeft = Math.ceil(
    (new Date(input.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a study planner. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Create 7-day study plan.
Days left: ${daysLeft}
Subjects: ${input.subjects.join(", ")}
Level: ${input.preparationLevel}
Hours/day: ${input.dailyHours}

Return JSON:
{
  "overview": "Plan overview",
  "dailyPlan": [
    {
      "date": "2026-05-23",
      "day": "Monday",
      "tasks": [
        {"subject": "Math", "topic": "Calculus", "duration": 60, "type": "study"}
      ],
      "totalHours": 4
    }
  ],
  "weeklyGoals": ["Goal 1"],
  "tips": ["Tip 1"]
}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });
    return safeJsonParse(res.choices?.[0]?.message?.content || "") || {
      overview: "Study plan",
      dailyPlan: [],
      weeklyGoals: [],
      tips: [],
    };
  });
}

// ======================================================
// PERFORMANCE PREDICTOR
// ======================================================
export async function predictPerformance(input: {
  attendance: number;
  internalMarks: number;
  studyHours: number;
  syllabusCompletion: number;
  subjects: string[];
}) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You predict exam performance. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Predict performance:
Attendance: ${input.attendance}%
Internal Marks: ${input.internalMarks}/100
Study Hours: ${input.studyHours}/day
Syllabus: ${input.syllabusCompletion}%
Subjects: ${input.subjects.join(", ")}

Return JSON:
{
  "passProbability": 85,
  "predictedMarks": 72,
  "grade": "B+",
  "weakSubjects": ["Math"],
  "strengths": ["Physics"],
  "recommendations": ["Study more"],
  "breakdown": [
    {"factor": "Attendance", "score": 80, "impact": "high"}
  ]
}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });
    return safeJsonParse(res.choices?.[0]?.message?.content || "") || {
      passProbability: 0,
      predictedMarks: 0,
      grade: "N/A",
      weakSubjects: [],
      strengths: [],
      recommendations: [],
      breakdown: [],
    };
  });
}

// ======================================================
// CHATBOT
// ======================================================
export async function chatWithAI(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  subject?: string
) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are ExamMind AI assistant helping students study.${
            subject ? ` Subject: ${subject}.` : ""
          } Be helpful, clear and encouraging.`,
        },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    return res.choices?.[0]?.message?.content || "Please try again.";
  });
}