"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  settings?: any;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, settings, children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-academic-bg">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar - viewport locked */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        logo={settings?.logo}
        journalName={settings?.journalName}
        shortName={settings?.shortName}
      />

      {/* Main Content Area - offset by 16rem (64) for fixed sidebar on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0">
        <AdminHeader
          user={user}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
