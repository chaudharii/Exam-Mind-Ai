// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/services/payment";
import { saveSubscription, logPayment, updateUserProfile } from "@/firebase/firestore";
import { PLANS } from "@/services/payment";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
      uid,
    } = await req.json();

    if (!uid || !planId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    const nextBillingDate = new Date();
    if (planId === "pro_monthly") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (planId === "pro_yearly") {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Save subscription to Firestore
    await saveSubscription(uid, {
      plan: planId,
      razorpayPaymentId: razorpay_payment_id,
      status: "active",
      amount: plan.price,
      currency: "INR",
      nextBillingDate: nextBillingDate.toISOString(),
    });

    // Update user profile
    await updateUserProfile(uid, {
      plan: planId,
      trialActive: false,
    });

    // Log payment
    await logPayment(uid, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: plan.price,
      currency: "INR",
      status: "paid",
      plan: planId,
    });

    return NextResponse.json({ success: true, message: "Subscription activated!" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
