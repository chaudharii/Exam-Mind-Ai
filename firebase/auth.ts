// firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  reload,
  User,
  onAuthStateChanged,
  ActionCodeSettings,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./config";

// Action code settings — production URL
const actionCodeSettings: ActionCodeSettings = {
  url: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?verified=true`
    : "https://exam-mind-ai-six.vercel.app/auth/login?verified=true",
  handleCodeInApp: false,
};

// Create user profile
async function createUserProfile(
  user: User,
  additionalData?: { displayName?: string }
) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    const { email, displayName, photoURL, uid } = user;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);
    await setDoc(userRef, {
      uid,
      email,
      displayName:
        additionalData?.displayName ||
        displayName ||
        email?.split("@")[0],
      photoURL: photoURL || null,
      plan: "free",
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

// Register
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
  const user = userCredential.user;

  await updateProfile(user, { displayName });
  await createUserProfile(user, { displayName });

  // Send verification with action URL
  try {
    await sendEmailVerification(user, actionCodeSettings);
    console.log("Verification email sent to:", email);
  } catch (e) {
    console.error("Verification email error:", e);
  }

  await signOut(auth);
  return user;
}

// Resend verification email
export async function resendVerificationEmail(
  email: string,
  password: string
) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  if (user.emailVerified) {
    await signOut(auth);
    throw new Error("Email already verified!");
  }

  await sendEmailVerification(user, actionCodeSettings);
  await signOut(auth);
  return true;
}

// Login
export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Reload to get latest emailVerified status
  await reload(user);

  return user;
}

// Google login
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
  await sendPasswordResetEmail(auth, email, {
    url: process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
      : "https://exam-mind-ai-six.vercel.app/auth/login",
  });
}

// Get user profile
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