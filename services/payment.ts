// services/payment.ts
import crypto from "crypto";

export const PAYMENTS_ENABLED = false; // payments disabled — product is free

export const PLANS = {
  free_trial: {
    id: "free_trial",
    name: "Free Trial",
    price: 0,
    duration: "2 days",
    features: [
      "5 AI requests/day",
      "Syllabus Analyzer",
      "Basic Notes",
      "AI Chatbot (limited)",
    ],
  },
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: 29900, // in paise (₹299)
    duration: "1 month",
    razorpayPlanId: "",
    features: [
      "Unlimited AI requests",
      "All features unlocked",
      "Handwritten Assignments",
      "PYQ Predictions",
      "Study Planner",
      "Performance Predictor",
      "Priority support",
    ],
  },
  pro_yearly: {
    id: "pro_yearly",
    name: "Pro Yearly",
    price: 199900, // ₹1999
    duration: "1 year",
    razorpayPlanId: "",
    savings: "Save ₹1,589",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Advanced analytics",
      "Export to PDF",
      "Priority support",
    ],
  },
};

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret?: string
): boolean {
  if (!secret) return false; // webhooks disabled / no secret
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false; // payments disabled
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

// Format price from paise to rupees
export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// Check if user is on active subscription
export function isSubscriptionActive(subscription: {
  status: string;
  plan: string;
  trialEndsAt?: string;
  nextBillingDate?: string;
}): boolean {
  if (subscription.plan === "trial") {
    if (!subscription.trialEndsAt) return false;
    return new Date(subscription.trialEndsAt) > new Date();
  }
  return subscription.status === "active";
}
