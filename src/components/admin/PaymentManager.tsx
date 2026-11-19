"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  QrCode,
  Upload,
  Sparkles,
  Trash2,
  Smartphone,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { toast } from "sonner";
import { getApiResponseError, getErrorMessage, formatPrice } from "@/lib/utils";

interface PaymentManagerProps {
  initialSettings: any;
  manuscripts: any[];
}

export function PaymentManager({ initialSettings, manuscripts }: PaymentManagerProps) {
  const router = useRouter();

  const [paymentFee, setPaymentFee] = useState(initialSettings.paymentFee?.toString() || "350");
  const [paymentCurrency, setPaymentCurrency] = useState(initialSettings.paymentCurrency || "USD");
  const [paymentProvider, setPaymentProvider] = useState(initialSettings.paymentProvider || "");
  const [paymentLink, setPaymentLink] = useState(initialSettings.paymentLink || "");
  const [paymentInstructions, setPaymentInstructions] = useState(initialSettings.paymentInstructions || "");

  // QR Code States
  const [paymentQrCode, setPaymentQrCode] = useState(initialSettings.paymentQrCode || "");
  const [qrMode, setQrMode] = useState<"auto" | "custom">(
    initialSettings.paymentQrCode ? "custom" : "auto"
  );
  const [autoQrPreview, setAutoQrPreview] = useState<string>("");

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Auto-generate QR code from paymentLink whenever paymentLink changes
  useEffect(() => {
    if (paymentLink && paymentLink.trim().startsWith("http")) {
      QRCode.toDataURL(paymentLink.trim(), {
        width: 320,
        margin: 2,
        color: {
          dark: "#102A43",
          light: "#FFFFFF",
        },
      })
        .then((url) => setAutoQrPreview(url))
        .catch((err) => console.error("Error generating QR:", err));
    } else {
      setAutoQrPreview("");
    }
  }, [paymentLink]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentQrCode(reader.result as string);
      setQrMode("custom");
    };
    reader.readAsDataURL(file);
  };

  // Quick manuscript payment status update
  const handleUpdatePaymentStatus = async (manuscriptId: string, newPaymentStatus: string) => {
    try {
      const res = await fetch(`/api/submissions/${manuscriptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to update payment status");
        throw new Error(errorMsg);
      }

      toast.success("Payment status updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update payment status"));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);

    const activeQrCode = qrMode === "custom" ? paymentQrCode : "";

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalName: initialSettings.journalName || "IJASR",
          paymentFee: Number(paymentFee),
          paymentCurrency,
          paymentProvider,
          paymentLink: paymentLink.trim(),
          paymentQrCode: activeQrCode,
          paymentInstructions,
        }),
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to update payment settings");
        throw new Error(errorMsg);
      }

      setSettingsSuccess("Payment settings and QR Code saved successfully!");
      toast.success("Payment settings and QR Code saved successfully!");
      router.refresh();
      setTimeout(() => setSettingsSuccess(null), 3500);
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "Failed to save payment settings.");
      setSettingsError(errMsg);
      toast.error(errMsg);
    } finally {
      setSavingSettings(false);
    }
  };

  const activePreview = qrMode === "custom" && paymentQrCode ? paymentQrCode : autoQrPreview;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
          Payment Settings & Verification
        </h1>
        <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
          Configure external payment links, author payment QR codes, and manually verify fee transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Payment Link, Fee, and QR Code Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white p-6 rounded-xl border border-academic-border shadow-sm space-y-5"
          >
            <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-royal" />
              <span>APC Configuration</span>
            </h3>

            {settingsSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            {/* Fee & Currency */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Article Fee *
                </label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={paymentFee}
                  onChange={(e) => setPaymentFee(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-academic-text mb-1">
                  Currency *
                </label>
                <Input
                  required
                  value={paymentCurrency}
                  onChange={(e) => setPaymentCurrency(e.target.value.toUpperCase())}
                  placeholder="USD, EUR, MYR, GBP"
                />
              </div>

              <div className="col-span-2 text-[11px] text-academic-muted flex items-center space-x-1.5 bg-academic-bg p-2 rounded-lg border border-academic-border">
                <span className="font-semibold text-navy">Display Preview:</span>
                <span className="font-mono text-royal font-bold">
                  {formatPrice(paymentFee || "0", paymentCurrency || "USD")} ({paymentCurrency})
                </span>
              </div>
            </div>

            {/* Provider Label */}
            <div className="text-xs">
              <label className="block font-semibold text-academic-text mb-1">
                Payment Provider Label
              </label>
              <Input
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value)}
                placeholder="e.g. Stripe Checkout, PayPal Business"
              />
            </div>

            {/* External URL */}
            <div className="text-xs">
              <label className="block font-semibold text-academic-text mb-1">
                External Payment URL *
              </label>
              <Input
                type="url"
                required
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://buy.stripe.com/..."
              />
              <span className="text-[10px] text-academic-muted mt-1 block">
                The public button and QR Code open this URL to complete the payment.
              </span>
            </div>

            {/* QR Code Section */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-navy flex items-center space-x-1.5">
                  <QrCode className="w-4 h-4 text-teal" />
                  <span>Payment QR Code</span>
                </label>
                <span className="text-[10px] text-academic-muted uppercase font-semibold">
                  Scan to Pay
                </span>
              </div>

              {/* Mode Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setQrMode("auto")}
                  className={`py-1.5 px-2 rounded-lg border font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    qrMode === "auto"
                      ? "bg-teal/10 border-teal text-teal font-bold shadow-xs"
                      : "bg-academic-bg border-academic-border text-academic-muted hover:text-navy"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto from URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQrMode("custom")}
                  className={`py-1.5 px-2 rounded-lg border font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    qrMode === "custom"
                      ? "bg-royal/10 border-royal text-royal font-bold shadow-xs"
                      : "bg-academic-bg border-academic-border text-academic-muted hover:text-navy"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Custom Image</span>
                </button>
              </div>

              {/* Custom Image Upload Controls */}
              {qrMode === "custom" && (
                <div className="space-y-2 bg-academic-bg p-3 rounded-lg border border-academic-border text-xs">
                  <div>
                    <label className="block font-semibold text-academic-text mb-1">
                      Upload QR Code Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-academic-text file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-royal/10 file:text-royal hover:file:bg-royal/20 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-academic-text mb-1">
                      Or Image URL
                    </label>
                    <Input
                      type="url"
                      value={paymentQrCode.startsWith("data:") ? "" : paymentQrCode}
                      onChange={(e) => setPaymentQrCode(e.target.value)}
                      placeholder="https://example.com/qr-code.png"
                    />
                  </div>

                  {paymentQrCode && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaymentQrCode("")}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2 text-xs space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Custom QR Code</span>
                    </Button>
                  )}
                </div>
              )}

              {/* QR Code Live Preview Box */}
              <div className="bg-academic-bg rounded-xl border border-academic-border p-4 text-center space-y-3">
                <div className="text-[11px] font-semibold text-academic-muted flex items-center justify-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-royal" />
                  <span>Frontend Live Preview</span>
                </div>

                {activePreview ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="p-2 bg-white rounded-lg border border-academic-border shadow-xs inline-block">
                      <img
                        src={activePreview}
                        alt="Payment QR Code Preview"
                        className="w-36 h-36 object-contain rounded"
                      />
                    </div>
                    <div className="text-[11px] text-academic-muted truncate max-w-[240px]">
                      Opens: <span className="font-mono text-royal font-semibold">{paymentLink || "None"}</span>
                    </div>
                    {paymentLink && (
                      <Button
                        href={paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-royal hover:bg-royal/10 space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test Scan Link</span>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-xs text-academic-muted space-y-1">
                    <QrCode className="w-8 h-8 text-academic-muted/50 mx-auto" />
                    <p>Enter an External Payment URL above to generate QR code preview.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs pt-2">
              <label className="block font-semibold text-academic-text mb-1">
                Payment Instructions for Authors
              </label>
              <Textarea
                rows={3}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                placeholder="Include reference ID instructions..."
              />
            </div>

            <Button
              type="submit"
              disabled={savingSettings}
              variant="teal"
              size="sm"
              className="w-full space-x-1.5 shadow-sm font-semibold"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Payment Settings & QR Code</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Manuscript Payment Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-academic-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy">
                  Manuscript Fee Tracker
                </h3>
                <p className="text-xs text-academic-muted">
                  Manually verify payments received via your external payment gateway.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-academic-bg text-navy uppercase tracking-wider font-semibold border-b border-academic-border">
                  <tr>
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4">Current Payment</th>
                    <th className="py-3 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {manuscripts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-academic-muted">
                        No manuscripts found.
                      </td>
                    </tr>
                  ) : (
                    manuscripts.map((sub) => (
                      <tr key={sub._id.toString()} className="hover:bg-academic-bg/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-royal whitespace-nowrap">
                          <Link href={`/admin/submissions/${sub._id.toString()}`} className="hover:underline">
                            {sub.submissionId}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-serif font-bold text-navy text-xs truncate">
                            {sub.title}
                          </div>
                          <div className="text-[11px] text-academic-muted">
                            {sub.authorName} ({sub.institution})
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-medium capitalize text-academic-muted">
                          {sub.status.replace("_", " ")}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <PaymentStatusBadge status={sub.paymentStatus} />
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <select
                            value={sub.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(sub._id.toString(), e.target.value)}
                            className="h-8 rounded border border-academic-border bg-white px-2 text-xs text-academic-text focus:outline-none focus:ring-1 focus:ring-royal cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="waived">Waived</option>
                            <option value="not_required">Not Required</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
