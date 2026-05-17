// firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./config";

// Create user profile in Firestore
async function createUserProfile(
  user: User,
  additionalData?: { displayName?: string }
) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const { email, displayName, photoURL, uid } = user;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 2);
    await setDoc(userRef, {
      uid,
      email,
      displayName:
        additionalData?.displayName ||
        displayName ||
        email?.split("@")[0],
      photoURL: photoURL || null,
      plan: "trial",
      trialEndsAt: trialEnd.toISOString(),
      trialActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      studyStreak: 0,
      lastActiveDate: new Date().toISOString(),
      subjects: [],
      aiUsageCount: 0,
      examReadiness: 0,
    });
  }
  return userRef;
}

// Register with email/password
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(userCredential.user, { displayName });
  await createUserProfile(userCredential.user, { displayName });
  try {
    await sendEmailVerification(userCredential.user);
    await signOut(auth);
  } catch (e) {
    console.warn("sendEmailVerification failed", e);
  }
  return userCredential.user;
}

// Login with email/password
export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  if (!userCredential.user.emailVerified) {
    await signOut(auth);
    const error = new Error("Email not verified") as Error & { code: string };
    error.code = "auth/email-not-verified";
    throw error;
  }
  return userCredential.user;
}

// Login with Google - always verified
export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  await createUserProfile(userCredential.user);
  return userCredential.user;
}

// Logout
export async function logout() {
  await signOut(auth);
}

// Reset password
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// Get current user profile
export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}