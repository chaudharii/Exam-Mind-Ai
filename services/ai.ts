import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
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

export async function analyzeSyllabus(syllabusText: string) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a syllabus analyzer. Return valid JSON only, no markdown." },
        { role: "user", content: `Analyze syllabus and return JSON: {"units":[{"name":"Unit","topics":["topic1"],"weightage":20}],"summary":"summary","importantTopics":["topic"],"totalTopics":5}\n\nSyllabus: ${syllabusText.slice(0, 3000)}` },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

export async function analyzePYQ(pyqText: string) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You analyze previous year question papers. Return valid JSON only, no markdown." },
        { role: "user", content: `Analyze PYQ and return JSON: {"repeatedQuestions":[{"question":"q","frequency":3,"probability":85}],"importantTopics":[{"topic":"t","weightage":30}],"predictions":[{"question":"q","probability":90,"reasoning":"r"}],"trends":["trend1"]}\n\nPYQ: ${pyqText.slice(0, 3000)}` },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

export async function generateNotes(topic: string, subject: string, noteType: string) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are an expert tutor for ${subject}. Return valid JSON only, no markdown.` },
        { role: "user", content: `Generate ${noteType} notes for "${topic}" in ${subject}. Return JSON: {"title":"Title","content":"detailed content here","keyPoints":["point1","point2"],"formulas":["formula1"],"definitions":{"term":"definition"}}` },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

export async function generateAssignmentAnswer(question: string, subject: string) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You write formal assignment answers. Return valid JSON only, no markdown." },
        { role: "user", content: `Write assignment for: "${question}" in ${subject}. Return JSON: {"answer":"full answer","wordCount":400,"sections":[{"heading":"Introduction","content":"intro text"},{"heading":"Main Body","content":"main text"},{"heading":"Conclusion","content":"conclusion text"}]}` },
      ],
      temperature: 0.5,
      max_tokens: 2500,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

export async function generateVivaQuestions(subject: string, topic: string) {
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a professor generating viva questions. Return valid JSON only, no markdown." },
        { role: "user", content: `Generate 8 viva questions for "${topic}" in ${subject}. Return JSON: {"questions":[{"question":"q","answer":"detailed answer","difficulty":"medium","followUps":["followup1"]}]}` },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

export async function generateStudyPlan(input: {
  examDate: string;
  subjects: string[];
  preparationLevel: string;
  dailyHours: number;
}) {
  const daysLeft = Math.ceil((new Date(input.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return withRetry(async () => {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a study planner. Return valid JSON only, no markdown." },
        { role: "user", content: `Create 7-day study plan. Days left: ${daysLeft}, Subjects: ${input.subjects.join(", ")}, Level: ${input.preparationLevel}, Hours/day: ${input.dailyHours}. Return JSON: {"overview":"plan overview","dailyPlan":[{"date":"2026-05-17","day":"Monday","tasks":[{"subject":"Math","topic":"Calculus","duration":60,"type":"study"}],"totalHours":4}],"weeklyGoals":["goal1"],"tips":["tip1"]}` },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

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
        { role: "system", content: "You predict exam performance. Return valid JSON only, no markdown." },
        { role: "user", content: `Predict performance. Attendance: ${input.attendance}%, Internal: ${input.internalMarks}/100, Study hours: ${input.studyHours}/day, Syllabus: ${input.syllabusCompletion}%, Subjects: ${input.subjects.join(", ")}. Return JSON: {"passProbability":85,"predictedMarks":72,"grade":"B+","weakSubjects":["Math"],"strengths":["Physics"],"recommendations":["Study more"],"breakdown":[{"factor":"Attendance","score":80,"impact":"high"}]}` },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  });
}

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
          content: `You are ExamMind AI, a helpful academic assistant for students. ${subject ? `Student is studying ${subject}.` : ""} Help students understand concepts and prepare for exams. Be clear and encouraging.`,
        },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    return res.choices[0].message.content || "Sorry, please try again!";
  });
}