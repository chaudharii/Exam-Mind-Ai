// app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield, CheckCircle, AlertCircle, Zap, Star, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { getSubscription, getPaymentHistory } from "@/firebase/firestore";
import { PLANS, formatPrice } from "@/services/payment";
import { toast } from "sonner";
import { formatDate, daysUntil } from "@/utils";

interface Subscription { plan: string; status: string; nextBillingDate?: string; trialEndsAt?: string; trialActive?: boolean; amount?: number; }
interface PaymentLog { id: string; amount: number; currency: string; status: string; createdAt: unknown; plan?: string; }

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export default function BillingPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentLog[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    if (!user) return;
    const [sub, history] = await Promise.all([
      getSubscription(user.uid),
      getPaymentHistory(user.uid),
    ]);
    setSubscription(sub as unknown as Subscription);
    setPaymentHistory(history as PaymentLog[]);
  };

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    setLoadingPlan(planId);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error("Payment gateway failed to load"); return; }

      // Create order via API
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, uid: user.uid }),
      });

      if (!orderRes.ok) throw new Error("Order creation failed");
      const { orderId, amount, currency, keyId } = await orderRes.json();

      const plan = PLANS[planId as keyof typeof PLANS];

      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ExamMind AI",
        description: `${plan.name} Subscription`,
        order_id: orderId,
        prefill: {
          email: user.email,
          name: userProfile?.displayName || "",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId,
                uid: user.uid,
              }),
            });

            if (!verifyRes.ok) throw new Error("Verification failed");

            toast.success("🎉 Subscription activated! Welcome to Pro!");
            await refreshProfile();
            await loadBillingData();
          } catch {
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setLoadingPlan(null);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment. Please try again.");
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!user || !confirm("Are you sure you want to cancel your subscription?")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/payment/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      if (!res.ok) throw new Error();
      toast.success("Subscription cancelled. You retain access until the end of billing period.");
      await loadBillingData();
      await refreshProfile();
    } catch {
      toast.error("Cancellation failed. Please contact support.");
    } finally {
      setCancelling(false);
    }
  };

  const currentPlan = userProfile?.plan || "trial";
  const isTrialActive = currentPlan === "trial" && userProfile?.trialEndsAt && new Date(userProfile.trialEndsAt) > new Date();
  const trialDaysLeft = userProfile?.trialEndsAt ? Math.max(0, daysUntil(userProfile.trialEndsAt)) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Current Plan Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border ${isTrialActive ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : currentPlan !== "trial" ? "bg-examind-50 dark:bg-examind-950/20 border-examind-200 dark:border-examind-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isTrialActive ? <Zap className="w-6 h-6 text-amber-500" /> : currentPlan !== "trial" ? <Star className="w-6 h-6 text-examind-500" /> : <AlertCircle className="w-6 h-6 text-red-500" />}
            <div>
              <h2 className="font-semibold text-lg">
                {isTrialActive ? "Free Trial Active" : currentPlan !== "trial" ? "Pro Subscription Active" : "Trial Expired"}
              </h2>
              <p className={`text-sm ${isTrialActive ? "text-amber-700 dark:text-amber-400" : currentPlan !== "trial" ? "text-examind-700 dark:text-examind-400" : "text-red-700 dark:text-red-400"}`}>
                {isTrialActive
                  ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} remaining — Free for 2 days. Continue only if you like it. Cancel anytime.`
                  : currentPlan !== "trial"
                  ? `Active • Next billing: ${subscription?.nextBillingDate ? formatDate(subscription.nextBillingDate) : "N/A"}`
                  : "Your free trial has ended. Upgrade to continue using all features."}
              </p>
            </div>
          </div>
          {currentPlan !== "trial" && (
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={cancelling} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              {cancelling ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Cancel"}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-semibold text-lg mb-4">Choose Your Plan</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Free Trial */}
          <div className={`bg-card border-2 rounded-2xl p-6 ${currentPlan === "trial" ? "border-amber-400" : "border-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="badge-trial">Free Trial</span>
              {currentPlan === "trial" && <Badge className="bg-amber-100 text-amber-700 text-xs">Current</Badge>}
            </div>
            <div className="text-3xl font-bold mb-1">₹0</div>
            <div className="text-muted-foreground text-sm mb-5">2 days free</div>
            <ul className="space-y-2 mb-6">
              {PLANS.free_trial.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled={true}>
              {isTrialActive ? `${trialDaysLeft} days left` : "Trial ended"}
            </Button>
          </div>

          {/* Pro Monthly */}
          <div className={`bg-card border-2 rounded-2xl p-6 relative ${currentPlan === "pro_monthly" ? "border-examind-500" : "border-border"}`}>
            {currentPlan !== "pro_monthly" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-examind-600 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="badge-pro">Pro Monthly</span>
              {currentPlan === "pro_monthly" && <Badge className="bg-examind-100 text-examind-700 text-xs">Active</Badge>}
            </div>
            <div className="text-3xl font-bold mb-1">{formatPrice(PLANS.pro_monthly.price)}</div>
            <div className="text-muted-foreground text-sm mb-5">per month</div>
            <ul className="space-y-2 mb-6">
              {PLANS.pro_monthly.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-examind-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button onClick={() => handleSubscribe("pro_monthly")}
              disabled={currentPlan === "pro_monthly" || loadingPlan === "pro_monthly"}
              className="w-full bg-examind-600 hover:bg-examind-700 text-white">
              {loadingPlan === "pro_monthly" ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : currentPlan === "pro_monthly" ? "Current Plan" : "Subscribe Now"}
            </Button>
          </div>

          {/* Pro Yearly */}
          <div className={`bg-card border-2 rounded-2xl p-6 ${currentPlan === "pro_yearly" ? "border-examind-500" : "border-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="badge-pro">Pro Yearly</span>
              {currentPlan === "pro_yearly" && <Badge className="bg-examind-100 text-examind-700 text-xs">Active</Badge>}
            </div>
            <div className="text-3xl font-bold mb-1">{formatPrice(PLANS.pro_yearly.price)}</div>
            <div className="text-muted-foreground text-sm mb-1">per year</div>
            <div className="text-green-500 text-xs font-semibold mb-4">Save ₹1,589!</div>
            <ul className="space-y-2 mb-6">
              {PLANS.pro_yearly.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button onClick={() => handleSubscribe("pro_yearly")}
              disabled={currentPlan === "pro_yearly" || loadingPlan === "pro_yearly"}
              variant={currentPlan === "pro_yearly" ? "outline" : "default"}
              className={currentPlan !== "pro_yearly" ? "w-full bg-amber-500 hover:bg-amber-600 text-white" : "w-full"}>
              {loadingPlan === "pro_yearly" ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : currentPlan === "pro_yearly" ? "Current Plan" : "Get Best Value"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Payment Methods */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-examind-500" />Accepted Payment Methods
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { name: "UPI", emoji: "📱" },
            { name: "Google Pay", emoji: "🟢" },
            { name: "PhonePe", emoji: "💜" },
            { name: "Paytm", emoji: "🔵" },
            { name: "Debit Card", emoji: "💳" },
            { name: "Net Banking", emoji: "🏦" },
          ].map((method) => (
            <div key={method.name} className="border border-border rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{method.emoji}</div>
              <p className="text-xs font-medium">{method.name}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-green-500" />
          All payments are secured by Razorpay with 256-bit encryption.
        </div>
      </motion.div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-examind-500" />Payment History
          </h3>
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{payment.plan || "Pro"} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.createdAt ? formatDate(new Date((payment.createdAt as { seconds: number }).seconds * 1000)) : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₹{((payment.amount || 0) / 100).toFixed(0)}</p>
                  <Badge className="text-xs bg-green-100 text-green-700">{payment.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
