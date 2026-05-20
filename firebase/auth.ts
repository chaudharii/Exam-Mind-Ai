// firebase/auth.ts
import {
  ActionCodeSettings,
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

const emailVerificationActionCodeSettings: ActionCodeSettings = {
  url:
    process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_URL ||
    "https://exam-mind-ai-six.vercel.app/auth/login",
  handleCodeInApp: false,
};

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
    await sendEmailVerification(
      userCredential.user,
      emailVerificationActionCodeSettings
    );
  } catch (error: unknown) {
    await signOut(auth);
    const authError = error as { message?: string };
    throw new Error(
      authError.message ||
        "Unable to send verification email. Please check Firebase email settings and try again."
    );
  }

  await signOut(auth);
  return userCredential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  await userCredential.user.reload();
  return userCredential.user;
}

export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  await createUserProfile(userCredential.user);
  return userCredential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  }
  return null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}