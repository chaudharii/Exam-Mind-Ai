// app/privacy/page.tsx
import Link from "next/link";
import { Brain } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly (name, email, academic data) and information generated through use of our services (AI queries, study plans, notes).</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve our AI-powered study tools, process payments, send service updates, and personalize your experience.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">3. Data Security</h2>
            <p>All data is encrypted in transit and at rest. We use Firebase's enterprise-grade security infrastructure. We do not store any payment details on our servers.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">4. Data Retention</h2>
            <p>We retain your data as long as your account is active. You can request deletion at any time by contacting support.</p>
          </section>
          <section>
            <h2 className="text-foreground font-semibold text-lg mb-3">5. Contact Us</h2>
            <p>For privacy concerns, contact: privacy@examindai.com</p>
          </section>
        </div>
      </main>
    </div>
  );
}
