"use client";

import React from "react";
import { User, Menu } from "lucide-react";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  onToggleSidebar?: () => void;
}

export function AdminHeader({ user, onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-academic-border px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-md text-academic-text hover:text-navy hover:bg-academic-bg lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-xs uppercase tracking-wider text-academic-muted font-bold truncate">
          Academic Journal Administration
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 pl-4 border-l border-academic-border">
          <div className="w-8 h-8 rounded-full bg-royal/10 text-royal flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-semibold text-academic-text">
              {user?.name || "Administrator"}
            </span>
            <span className="text-xs text-academic-muted">{user?.email || "admin@journal.ac.org"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
