"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-academic-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy via-navy to-royal text-white p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto text-white shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">
              IJASR Editorial Portal
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Authorized Staff & Administrator Login Only
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                required
                placeholder="admin@journal.ac.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
              <Mail className="w-4 h-4 text-academic-muted absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
              <Lock className="w-4 h-4 text-academic-muted absolute left-3 top-3" />
            </div>
          </div>

          <Button
            type="submit"
            variant="royal"
            disabled={loading}
            className="w-full py-2.5 font-semibold text-sm shadow-md"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </span>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </Button>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-academic-muted">
              Demo admin credentials from .env.local:
              <br />
              <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">
                admin@journal.ac.org / AdminPassword2026!
              </code>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
