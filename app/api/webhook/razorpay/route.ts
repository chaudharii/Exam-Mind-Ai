// app/api/webhook/razorpay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/services/payment";
import { saveSubscription, updateUserProfile, logPayment } from "@/firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log("Razorpay webhook event:", eventType);

    if (eventType === "payment.captured") {
      const payment = payload.payment.entity;
      const uid = payment.notes?.uid;

      if (uid) {
        await logPayment(uid, {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: "captured",
          method: payment.method,
        });
      }
    }

    if (eventType === "subscription.charged") {
      const subscription = payload.subscription.entity;
      const uid = subscription.notes?.uid;

      if (uid) {
        const nextBilling = new Date(subscription.current_end * 1000);
        await saveSubscription(uid, {
          plan: subscription.notes?.planId || "pro_monthly",
          razorpaySubscriptionId: subscription.id,
          status: "active",
          amount: subscription.quantity * 100,
          currency: "INR",
          nextBillingDate: nextBilling.toISOString(),
        });
      }
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.completed") {
      const subscription = payload.subscription.entity;
      const uid = subscription.notes?.uid;

      if (uid) {
        await updateUserProfile(uid, { plan: "trial" });
        await saveSubscription(uid, {
          plan: "cancelled",
          status: "cancelled",
          amount: 0,
          currency: "INR",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
