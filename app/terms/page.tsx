// app/terms/page.tsx
import Link from "next/link";
import { Brain } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">ExamMind AI</span>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
            <p>By using ExamMind AI, you agree to these terms. If you don't agree, please don't use our service.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">2. Free Trial</h2>
            <p>New users get a 2-day free trial with limited features. No credit card is required during the trial period. After the trial ends, you must subscribe to continue using premium features.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">3. Subscriptions & Billing</h2>
            <p>Subscriptions auto-renew unless cancelled. You can cancel at any time. Refunds are processed within 7 business days for requests made within 24 hours of billing.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">4. Acceptable Use</h2>
            <p>You may not use ExamMind AI for cheating in examinations where AI assistance is prohibited. The AI-generated content is for study assistance only. We are not responsible for academic misconduct.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">5. Intellectual Property</h2>
            <p>AI-generated content belongs to you. Our platform, design, and underlying technology are owned by ExamMind AI.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">6. Contact</h2>
            <p>For questions: support@examindai.com</p>
          </section>
        </div>
      </main>
    </div>
  );
}
