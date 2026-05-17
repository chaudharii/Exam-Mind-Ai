// app/api/webhook/razorpay/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  // Webhook disabled because payments have been removed.
  return NextResponse.json({ error: "Payments are disabled" }, { status: 410 });
}
