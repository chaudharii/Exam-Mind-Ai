// firebase/firestore.ts
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// =========================================
// USER SERVICES
// =========================================

export async function updateUserProfile(uid: string, data: Record<string, unknown>) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// =========================================
// UPLOADS / SYLLABUS
// =========================================

export async function saveUpload(uid: string, data: {
  type: string;
  fileName: string;
  fileUrl: string;
  analysis?: Record<string, unknown>;
  subject?: string;
}) {
  const ref = await addDoc(collection(db, "uploads"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserUploads(uid: string) {
  const q = query(
    collection(db, "uploads"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =========================================
// NOTES
// =========================================

export async function saveNote(uid: string, data: {
  subject: string;
  topic: string;
  type: string;
  content: string;
}) {
  const ref = await addDoc(collection(db, "notes"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserNotes(uid: string) {
  const q = query(
    collection(db, "notes"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =========================================
// ASSIGNMENTS
// =========================================

export async function saveAssignment(uid: string, data: {
  question: string;
  answer: string;
  subject?: string;
  pdfUrl?: string;
}) {
  const ref = await addDoc(collection(db, "assignments"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserAssignments(uid: string) {
  const q = query(
    collection(db, "assignments"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =========================================
// CHAT HISTORY
// =========================================

export async function saveChatMessage(uid: string, data: {
  role: "user" | "assistant";
  content: string;
  sessionId: string;
}) {
  await addDoc(collection(db, "chatHistory"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getChatHistory(uid: string, sessionId: string) {
  const q = query(
    collection(db, "chatHistory"),
    where("uid", "==", uid),
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =========================================
// STUDY PLANS
// =========================================

export async function saveStudyPlan(uid: string, data: {
  examDate: string;
  subjects: string[];
  preparationLevel: string;
  plan: Record<string, unknown>;
}) {
  const ref = await addDoc(collection(db, "studyPlans"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserStudyPlans(uid: string) {
  const q = query(
    collection(db, "studyPlans"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// =========================================
// PREDICTIONS
// =========================================

export async function savePrediction(uid: string, data: Record<string, unknown>) {
  const ref = await addDoc(collection(db, "predictions"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// =========================================
// SUBSCRIPTIONS
// =========================================

export async function saveSubscription(uid: string, data: {
  plan: string;
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string;
  status: string;
  amount: number;
  currency: string;
  nextBillingDate?: string;
}) {
  const subRef = doc(db, "subscriptions", uid);
  await setDoc(subRef, {
    uid,
    ...data,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export async function getSubscription(uid: string) {
  const subRef = doc(db, "subscriptions", uid);
  const snap = await getDoc(subRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// =========================================
// PAYMENT LOGS
// =========================================

export async function logPayment(uid: string, data: Record<string, unknown>) {
  await addDoc(collection(db, "paymentLogs"), {
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getPaymentHistory(uid: string) {
  const q = query(
    collection(db, "paymentLogs"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Update study streak
export async function updateStudyStreak(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    const lastActive = new Date(userData.lastActiveDate || "");
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = userData.studyStreak || 0;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    await updateDoc(userRef, {
      studyStreak: newStreak,
      lastActiveDate: today.toISOString(),
      updatedAt: serverTimestamp(),
    });

    return newStreak;
  }
  return 0;
}
