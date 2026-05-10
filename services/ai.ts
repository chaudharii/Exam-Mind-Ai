// services/ai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting tracker
const requestTracker = new Map<string, number[]>();

function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = requestTracker.get(identifier) || [];
  const windowStart = now - windowMs;
  const recentRequests = requests.filter((t) => t > windowStart);

  if (recentRequests.length >= maxRequests) return false;

  recentRequests.push(now);
  requestTracker.set(identifier, recentRequests);
  return true;
}

// Retry helper
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (i === retries - 1) throw error;
      const err = error as { status?: number };
      if (err.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

// =========================================
// SYLLABUS ANALYZER
// =========================================

export async function analyzeSyllabus(syllabusText: string): Promise<{
  units: Array<{ name: string; topics: string[]; weightage: number }>;
  summary: string;
  importantTopics: string[];
  totalTopics: number;
}> {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert academic syllabus analyzer. Extract structured information from syllabi.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Analyze this syllabus and return JSON with:
          {
            "units": [{"name": "Unit Name", "topics": ["topic1", "topic2"], "weightage": 20}],
            "summary": "Brief summary",
            "importantTopics": ["most important topics"],
            "totalTopics": 0
          }
          
          Syllabus:
          ${syllabusText.slice(0, 4000)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// PYQ PREDICTION ENGINE
// =========================================

export async function analyzePYQ(pyqText: string): Promise<{
  repeatedQuestions: Array<{ question: string; frequency: number; probability: number }>;
  importantTopics: Array<{ topic: string; weightage: number }>;
  predictions: Array<{ question: string; probability: number; reasoning: string }>;
  trends: string[];
}> {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing previous year question papers and predicting exam questions.
          Perform frequency analysis, detect trends, and generate probability scores.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Analyze these PYQ papers and return JSON with:
          {
            "repeatedQuestions": [{"question": "...", "frequency": 3, "probability": 85}],
            "importantTopics": [{"topic": "...", "weightage": 30}],
            "predictions": [{"question": "...", "probability": 90, "reasoning": "..."}],
            "trends": ["trend1", "trend2"]
          }
          
          PYQ Content:
          ${pyqText.slice(0, 4000)}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// NOTES GENERATOR
// =========================================

export async function generateNotes(
  topic: string,
  subject: string,
  noteType: "short" | "long" | "revision" | "formulas" | "definitions"
): Promise<{
  title: string;
  content: string;
  keyPoints: string[];
  formulas?: string[];
  definitions?: Record<string, string>;
}> {
  const typePrompts = {
    short: "Generate concise short notes with bullet points",
    long: "Generate comprehensive detailed notes with explanations",
    revision: "Generate quick revision points for last-minute study",
    formulas: "Generate all important formulas with explanations",
    definitions: "Generate key definitions and terminology",
  };

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert academic tutor specializing in ${subject}.
          ${typePrompts[noteType]}.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Generate ${noteType} notes for: "${topic}" in ${subject}.
          Return JSON:
          {
            "title": "Note title",
            "content": "Detailed content with proper formatting",
            "keyPoints": ["point1", "point2"],
            "formulas": ["formula1"],
            "definitions": {"term": "definition"}
          }`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// ASSIGNMENT GENERATOR
// =========================================

export async function generateAssignmentAnswer(
  question: string,
  subject: string
): Promise<{
  answer: string;
  wordCount: number;
  sections: Array<{ heading: string; content: string }>;
}> {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a student writing a formal assignment answer.
          Write in a clear, academic style appropriate for university students.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Write a comprehensive assignment answer for: "${question}" in ${subject}.
          Return JSON:
          {
            "answer": "Complete answer text",
            "wordCount": 500,
            "sections": [
              {"heading": "Introduction", "content": "..."},
              {"heading": "Main Body", "content": "..."},
              {"heading": "Conclusion", "content": "..."}
            ]
          }`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// VIVA PREPARATION
// =========================================

export async function generateVivaQuestions(
  subject: string,
  topic: string
): Promise<{
  questions: Array<{
    question: string;
    answer: string;
    difficulty: "easy" | "medium" | "hard";
    followUps: string[];
  }>;
}> {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert professor conducting viva examinations.
          Generate challenging but fair questions with complete answers.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Generate 10 viva questions for "${topic}" in ${subject}.
          Return JSON:
          {
            "questions": [
              {
                "question": "...",
                "answer": "Detailed answer...",
                "difficulty": "medium",
                "followUps": ["follow-up 1", "follow-up 2"]
              }
            ]
          }`,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// STUDY PLANNER
// =========================================

export async function generateStudyPlan(input: {
  examDate: string;
  subjects: string[];
  preparationLevel: string;
  dailyHours: number;
}): Promise<{
  overview: string;
  dailyPlan: Array<{
    date: string;
    day: string;
    tasks: Array<{ subject: string; topic: string; duration: number; type: string }>;
    totalHours: number;
  }>;
  weeklyGoals: string[];
  tips: string[];
}> {
  const daysLeft = Math.ceil(
    (new Date(input.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert academic counselor and study planner.
          Create realistic, achievable study plans.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Create a study plan:
          - Days until exam: ${daysLeft}
          - Subjects: ${input.subjects.join(", ")}
          - Preparation level: ${input.preparationLevel}
          - Daily available hours: ${input.dailyHours}
          
          Return JSON for next 7 days:
          {
            "overview": "Plan overview",
            "dailyPlan": [
              {
                "date": "2024-01-01",
                "day": "Monday",
                "tasks": [
                  {"subject": "Math", "topic": "Calculus", "duration": 60, "type": "study"}
                ],
                "totalHours": 4
              }
            ],
            "weeklyGoals": ["goal1"],
            "tips": ["tip1"]
          }`,
        },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// PERFORMANCE PREDICTOR
// =========================================

export async function predictPerformance(input: {
  attendance: number;
  internalMarks: number;
  studyHours: number;
  syllabusCompletion: number;
  subjects: string[];
}): Promise<{
  passProbability: number;
  predictedMarks: number;
  grade: string;
  weakSubjects: string[];
  strengths: string[];
  recommendations: string[];
  breakdown: Array<{ factor: string; score: number; impact: string }>;
}> {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an academic performance prediction AI.
          Analyze student data and predict exam performance using weighted scoring.
          Always respond with valid JSON only, no markdown.`,
        },
        {
          role: "user",
          content: `Predict exam performance for student:
          - Attendance: ${input.attendance}%
          - Internal Marks: ${input.internalMarks}/100
          - Daily Study Hours: ${input.studyHours}
          - Syllabus Completion: ${input.syllabusCompletion}%
          - Subjects: ${input.subjects.join(", ")}
          
          Return JSON:
          {
            "passProbability": 85,
            "predictedMarks": 72,
            "grade": "B+",
            "weakSubjects": ["Math"],
            "strengths": ["Physics"],
            "recommendations": ["Study more..."],
            "breakdown": [
              {"factor": "Attendance", "score": 80, "impact": "high"}
            ]
          }`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  });
}

// =========================================
// CHATBOT
// =========================================

export async function chatWithAI(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  subject?: string
): Promise<string> {
  return withRetry(async () => {
    const systemPrompt = `You are ExamMind AI, a helpful academic assistant for students.
    ${subject ? `The student is studying ${subject}.` : ""}
    Help students understand concepts, solve problems, and prepare for exams.
    Be encouraging, clear, and thorough in your explanations.
    Use examples and analogies to explain complex topics.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
  });
}

export { checkRateLimit };
