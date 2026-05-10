// app/api/payment/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveSubscription, updateUserProfile } from "@/firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await saveSubscription(uid, {
      plan: "cancelled",
      status: "cancelled",
      amount: 0,
      currency: "INR",
    });

    await updateUserProfile(uid, { plan: "trial" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
  }
}
