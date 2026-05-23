"use client";

import { motion } from "framer-motion";
import {
  Star,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
      >
        <div className="flex items-start gap-3">

          <Star className="w-6 h-6 text-green-500" />

          <div>
            <h2 className="font-semibold text-lg">
              All Features Unlocked
            </h2>

            <p className="text-sm text-green-700 dark:text-green-400">
              ExamMind AI is completely free now.
              No subscription and no payment required.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="font-semibold text-lg mb-4">
          Current Plan
        </h3>

        <div className="bg-card border rounded-2xl p-6">

          <div className="flex justify-between items-center">

            <div>
              <h4 className="font-semibold">
                Free Plan
              </h4>

              <p className="text-sm text-muted-foreground">
                Unlimited access to all ExamMind AI tools.
              </p>
            </div>

            <Badge className="bg-green-100 text-green-700">
              ACTIVE
            </Badge>

          </div>
        </div>
      </motion.div>

      {/* Payment Removed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border rounded-2xl p-6"
      >
        <div className="flex gap-2 items-center">

          <AlertCircle className="w-5 h-5" />

          <h3 className="font-semibold">
            Payments Disabled
          </h3>

        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Billing and subscriptions have been removed.
        </p>
      </motion.div>

    </div>
  );
}