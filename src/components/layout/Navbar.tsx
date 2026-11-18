"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/editorial-board", label: "Editorial Board" },
  { href: "/current-issue", label: "Current Issue" },
  { href: "/archives", label: "Archives" },
  { href: "/author-guidelines", label: "Guidelines" },
  { href: "/publication-fees", label: "Fees" },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  journalName?: string;
  logo?: string;
  shortName?: string;
  settings?: any;
}

export function Navbar({ journalName, logo, shortName, settings }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const effectiveLogo = logo || settings?.logo;
  const effectiveShortName = shortName || settings?.shortName || "IJASR";
  const effectiveJournalName = journalName || settings?.journalName || "International Journal of Advanced Scientific Research";
  const effectiveIssn = settings?.issn || "2834-912X";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-academic-border bg-white/95 backdrop-blur shadow-xs">
      {/* Top Banner with journal title and quick admin access */}
      <div className="bg-navy text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-semibold tracking-wide uppercase bg-teal px-2 py-0.5 rounded text-[10px]">
              Open Access
            </span>
            <span className="hidden sm:inline text-gray-300">
              Peer-Reviewed Scholarly Publishing • ISSN: {effectiveIssn}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-18 sm:min-h-24 py-2 sm:py-3 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group shrink-0 cursor-pointer py-1">
            {effectiveLogo ? (
              <img
                src={effectiveLogo}
                alt={effectiveJournalName}
                className="h-12 sm:h-16 md:h-18 lg:h-20 w-auto max-w-[220px] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[380px] object-contain object-left transition-transform group-hover:scale-[1.01]"
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg bg-royal flex items-center justify-center text-white shadow-md group-hover:bg-navy transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-black text-2xl text-navy tracking-tight group-hover:text-royal transition-colors">
                    {effectiveShortName}
                  </span>
                  <span className="text-[10px] text-academic-muted font-sans font-semibold uppercase tracking-wider">
                    Academic Journal
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-md text-xs lg:text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "text-royal font-semibold bg-royal/10"
                      : "text-academic-text hover:text-royal hover:bg-academic-bg"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action button */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <Button
              href="/submit-manuscript"
              variant="teal"
              size="sm"
              className="space-x-1.5 font-semibold shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Manuscript</span>
            </Button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Button
              href="/submit-manuscript"
              variant="teal"
              size="sm"
              className="text-xs px-2.5 sm:hidden"
            >
              Submit
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-academic-text hover:text-navy hover:bg-academic-bg focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-academic-border bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "text-royal font-semibold bg-royal/10"
                    : "text-academic-text hover:bg-academic-bg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-academic-border mt-3">
            <Button
              href="/submit-manuscript"
              variant="teal"
              className="w-full justify-center space-x-2 font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Send className="w-4 h-4" />
              <span>Submit Manuscript</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
