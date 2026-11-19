"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, AlertCircle, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const defaultAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@journal.ac.org";
const defaultAdminPassword = "AdminPassword2026!";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oneClickLoading, setOneClickLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [shortName, setShortName] = useState("IJASR");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.settings?.logo) setLogo(data.settings.logo);
        if (data?.settings?.shortName) setShortName(data.settings.shortName);
      })
      .catch(() => {});
  }, []);

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPass,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result?.ok) {
        toast.success("Login successful! Redirecting to dashboard...");
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      const errMsg = err?.message || "Failed to authenticate.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await performLogin(email, password);
    setLoading(false);
  };

  const handleOneClickLogin = async () => {
    setEmail(defaultAdminEmail);
    setPassword(defaultAdminPassword);
    setOneClickLoading(true);
    await performLogin(defaultAdminEmail, defaultAdminPassword);
    setOneClickLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-academic-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy via-navy to-royal text-white p-8 text-center space-y-3">
          {logo ? (
            <div className="bg-white p-3 rounded-2xl inline-flex items-center justify-center mx-auto shadow-lg border border-white/30">
              <img
                src={logo}
                alt="Journal Logo"
                className="h-13 sm:h-15 w-auto max-w-[220px] object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto text-white shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="font-serif font-bold text-2xl text-white">
              {shortName} Editorial Portal
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Authorized Staff & Administrator Login
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Fast Login Button */}
          <Button
            type="button"
            onClick={handleOneClickLogin}
            disabled={oneClickLoading || loading}
            variant="teal"
            className="w-full py-2.5 font-bold text-sm shadow-md space-x-2 bg-teal hover:bg-teal-dark transition-all cursor-pointer"
          >
            {oneClickLoading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Admin...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>1-Click Quick Admin Login</span>
              </span>
            )}
          </Button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-academic-muted uppercase font-semibold">
              Or Sign In with Credentials
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={loading || oneClickLoading}
              className="w-full py-2.5 font-semibold text-sm shadow-md cursor-pointer"
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
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setEmail(defaultAdminEmail);
                setPassword(defaultAdminPassword);
              }}
              className="text-[11px] text-academic-muted hover:text-royal transition-colors cursor-pointer"
            >
              Click to autofill credentials: <br />
              <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-navy font-semibold">
                {defaultAdminEmail} / {defaultAdminPassword}
              </code>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
