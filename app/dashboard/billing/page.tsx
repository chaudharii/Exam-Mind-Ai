// app/dashboard/billing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Zap, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  getSubscription,
  getPaymentHistory,
} from "@/firebase/firestore";
import { toast } from "sonner";
import { formatDate } from "@/utils";

interface Subscription {
  plan: string;
  status: string;
  nextBillingDate?: string;
  trialEndsAt?: string;
  trialActive?: boolean;
  amount?: number;
}

interface PaymentLog {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: unknown;
  plan?: string;
}

export default function BillingPage() {
  const { user } = useAuth();

  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [paymentHistory, setPaymentHistory] =
    useState<PaymentLog[]>([]);

  const [loadingPlan, setLoadingPlan] =
    useState<string | null>(null);

  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    if (!user) return;

    try {
      const [sub, history] = await Promise.all([
        getSubscription(user.uid),
        getPaymentHistory(user.uid),
      ]);

      // FIXED TYPESCRIPT ERROR
      setSubscription(
        sub as unknown as Subscription
      );

      setPaymentHistory(
        history as PaymentLog[]
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load billing data"
      );
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);

      toast.error(
        "Payments are disabled — no subscription to cancel."
      );
    } finally {
      setCancelling(false);
    }
  };

  const currentPlan =
    (subscription?.plan as "free" | "trial" | "premium") ?? "free";

  const isTrialActive = subscription?.trialActive ?? false;
  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Current Plan Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border ${
          isTrialActive
            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            : currentPlan !== "trial"
            ? "bg-examind-50 dark:bg-examind-950/20 border-examind-200 dark:border-examind-800"
            : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isTrialActive ? (
              <Zap className="w-6 h-6 text-amber-500" />
            ) : currentPlan !== "trial" ? (
              <Star className="w-6 h-6 text-examind-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}

            <div>
              <h2 className="font-semibold text-lg">
                {isTrialActive
                  ? "Free Trial Active"
                  : currentPlan !== "trial"
                  ? "Pro Subscription Active"
                  : "Trial Expired"}
              </h2>

              <p
                className={`text-sm ${
                  isTrialActive
                    ? "text-amber-700 dark:text-amber-400"
                    : currentPlan !== "trial"
                    ? "text-examind-700 dark:text-examind-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {isTrialActive
                  ? `${trialDaysLeft} day${
                      trialDaysLeft !== 1
                        ? "s"
                        : ""
                    } remaining — Free for 2 days. Continue only if you like it. Cancel anytime.`
                  : currentPlan !== "trial"
                  ? `Active • Next billing: ${
                      subscription?.nextBillingDate
                        ? formatDate(
                            subscription.nextBillingDate
                          )
                        : "N/A"
                    }`
                  : "Your free trial has ended. Upgrade to continue using all features."}
              </p>
            </div>
          </div>

          {currentPlan === "free" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {cancelling ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                "Cancel"
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-semibold text-lg mb-4">
          Choose Your Plan
        </h3>

        <div className="grid md:grid-cols-1 gap-4">
          <div className="bg-card border-2 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold">
                  All features are free
                </h4>

                <p className="text-sm text-muted-foreground">
                  ExamMind AI is now free for all users —
                  no payments required.
                </p>
              </div>

              <Badge className="bg-green-100 text-green-700 text-xs">
                Free
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              You have access to all tools and features
              without subscribing.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payments removed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-semibold mb-2">
          Payments Disabled
        </h3>

        <p className="text-sm text-muted-foreground">
          Payment options have been removed.
          All features are available for free.
        </p>
      </motion.div>
    </div>
  );
}