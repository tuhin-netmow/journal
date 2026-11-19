"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  BookMarked,
  Layers,
  Calendar,
  Users,
  Globe,
  CreditCard,
  Mail,
  Sliders,
  LogOut,
  ExternalLink,
  BookOpen,
  X,
  Tag,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Manuscripts", icon: FileText },
  { href: "/admin/articles", label: "Published Articles", icon: BookMarked },
  {
    href: "/admin/settings?tab=taxonomy#taxonomy",
    label: "Categories & Types",
    icon: Tag,
    tab: "taxonomy",
  },
  { href: "/admin/volumes", label: "Volumes", icon: Layers },
  { href: "/admin/issues", label: "Issues", icon: Calendar },
  { href: "/admin/editorial-board", label: "Editorial Board", icon: Users },
  { href: "/admin/content", label: "Website Content", icon: Globe },
  { href: "/admin/payments", label: "Payment Settings", icon: CreditCard },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  {
    href: "/admin/settings",
    label: "Journal Settings",
    icon: Sliders,
    tab: "general",
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  logo?: string;
  journalName?: string;
  shortName?: string;
}

export function AdminSidebar({
  isOpen = false,
  onClose,
  logo,
  journalName,
  shortName,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 h-screen bg-navy text-white flex flex-col border-r border-navy-light shadow-xl transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-navy-light shrink-0">
        <Link href="/admin" onClick={onClose} className="flex items-center space-x-2.5 min-w-0">
          {logo ? (
            <div className="bg-white px-2 py-1 rounded-md shadow-xs flex items-center justify-center shrink-0 border border-white/20">
              <img
                src={logo}
                alt={journalName || "Journal Logo"}
                className="h-8.5 w-auto max-w-[125px] object-contain"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-royal flex items-center justify-center text-white font-bold shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="font-serif font-bold text-sm tracking-wide truncate">
              {shortName ? `${shortName} Admin` : "IJASR Admin"}
            </span>
            <span className="text-[10px] text-gray-400">Editorial Portal</span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-navy-light lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation items - independently scrollable if items exceed height */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = (() => {
            if (item.href === "/admin") {
              return pathname === "/admin";
            }
            if (item.tab === "taxonomy") {
              return pathname === "/admin/settings" && currentTab === "taxonomy";
            }
            if (item.tab === "general") {
              return pathname === "/admin/settings" && currentTab !== "taxonomy";
            }
            return pathname.startsWith(item.href);
          })();

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-royal text-white shadow-sm font-semibold"
                  : "text-gray-300 hover:text-white hover:bg-navy-light"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-navy-light space-y-2 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-300 rounded hover:bg-navy-light hover:text-white transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>

        <Link
          href="/admin/login"
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-300 rounded hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
