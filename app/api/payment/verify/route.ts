// app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: "Payments are disabled" }, { status: 410 });
}
