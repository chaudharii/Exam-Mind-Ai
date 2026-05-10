// components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  LayoutDashboard,
  FileText,
  TrendingUp,
  BookOpen,
  PenTool,
  Mic,
  Calendar,
  MessageSquare,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/lib/auth-context";
import { logout } from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/utils";

const navItems = [
  {
    group: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/dashboard/syllabus", icon: FileText, label: "Syllabus Analyzer" },
      { href: "/dashboard/pyq", icon: TrendingUp, label: "PYQ Predictions" },
      { href: "/dashboard/notes", icon: BookOpen, label: "AI Notes" },
      { href: "/dashboard/assignments", icon: PenTool, label: "Assignments" },
    ],
  },
  {
    group: "Tools",
    items: [
      { href: "/dashboard/viva", icon: Mic, label: "Viva Prep" },
      { href: "/dashboard/planner", icon: Calendar, label: "Study Planner" },
      { href: "/dashboard/chatbot", icon: MessageSquare, label: "AI Chatbot" },
      { href: "/dashboard/predictor", icon: BarChart3, label: "Performance" },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-examind-500 to-purple-600 flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-sidebar-foreground text-base">ExamMind AI</span>
          <div className="flex items-center gap-1 mt-0.5">
            {userProfile?.plan === "trial" ? (
              <span className="badge-trial text-[10px] py-0">
                <Sparkles className="w-2.5 h-2.5" /> Trial
              </span>
            ) : (
              <span className="badge-pro text-[10px] py-0">
                <Sparkles className="w-2.5 h-2.5" /> Pro
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-sidebar-foreground/30 uppercase tracking-widest px-3 mb-2">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "sidebar-link group",
                      isActive && "active"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile at Bottom */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={user?.photoURL || ""} />
            <AvatarFallback className="bg-examind-600 text-white text-xs">
              {getInitials(userProfile?.displayName || user?.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userProfile?.displayName || "Student"}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex-col z-30">
        <SidebarContent />
      </div>

      {/* Mobile Hamburger Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
