// app/api/payment/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PLANS } from "@/services/payment";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { planId, uid } = await req.json();
    if (!uid || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan || plan.price === 0) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: plan.price, // already in paise
      currency: "INR",
      receipt: `receipt_${uid}_${Date.now()}`,
      notes: { uid, planId },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
