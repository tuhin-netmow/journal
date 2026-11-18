"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Key,
  Globe,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Upload,
  Trash2,
  Image as ImageIcon,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface JournalSettingsFormProps {
  initialSettings: any;
}

export function JournalSettingsForm({ initialSettings }: JournalSettingsFormProps) {
  const router = useRouter();

  // General settings
  const [journalName, setJournalName] = useState(initialSettings.journalName || "");
  const [shortName, setShortName] = useState(initialSettings.shortName || "");
  const [issn, setIssn] = useState(initialSettings.issn || "");
  const [publisherName, setPublisherName] = useState(initialSettings.publisherName || "");
  const [publicationFrequency, setPublicationFrequency] = useState(
    initialSettings.publicationFrequency || ""
  );
  const [email, setEmail] = useState(initialSettings.email || "");
  const [phone, setPhone] = useState(initialSettings.phone || "");
  const [address, setAddress] = useState(initialSettings.address || "");
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor || "#102A43");
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondaryColor || "#1769AA");
  const [description, setDescription] = useState(initialSettings.description || "");
  const [logo, setLogo] = useState(initialSettings.logo || "");

  // Mailgun Configuration Settings
  const [mailgunApiKey, setMailgunApiKey] = useState(initialSettings.mailgunApiKey || "");
  const [mailgunDomain, setMailgunDomain] = useState(initialSettings.mailgunDomain || "");
  const [mailgunUrl, setMailgunUrl] = useState(initialSettings.mailgunUrl || "https://api.mailgun.net");
  const [mailgunFrom, setMailgunFrom] = useState(
    initialSettings.mailgunFrom || '"IJASR Editorial Office" <editorial@journal.ac.org>'
  );
  const [showApiKey, setShowApiKey] = useState(false);

  // Test Email States
  const [testEmail, setTestEmail] = useState(initialSettings.email || "editorial@journal.ac.org");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestEmailResult({
        success: false,
        message: "Please enter a valid recipient email address.",
      });
      return;
    }

    setTestingEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: testEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send test email");
      }

      const msg = data.message || `Test email successfully sent to ${testEmail}!`;
      setTestEmailResult({
        success: true,
        message: msg,
      });
      toast.success(msg);
    } catch (err: any) {
      const errMsg = err.message || "Failed to deliver test email.";
      setTestEmailResult({
        success: false,
        message: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    // For SVG images, read directly as Data URL
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }

    // For raster images, resize and compress using canvas
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL("image/png", 0.9);
          setLogo(optimizedDataUrl);
        } else {
          setLogo(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalName,
          shortName,
          issn,
          publisherName,
          publicationFrequency,
          email,
          phone,
          address,
          primaryColor,
          secondaryColor,
          description,
          logo: logo.trim(),
          mailgunApiKey: mailgunApiKey.trim(),
          mailgunDomain: mailgunDomain.trim(),
          mailgunUrl: mailgunUrl.trim(),
          mailgunFrom: mailgunFrom.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update journal settings");
      }

      setSuccess("Journal & Mailgun settings updated successfully! Changes are live.");
      toast.success("Journal & Mailgun settings updated successfully!");
      router.refresh();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
            Journal Settings
          </h1>
          <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
            Configure global journal metadata, ISSN numbers, publisher identity, Mailgun email service, and branding.
          </p>
        </div>

        <Button
          type="submit"
          variant="teal"
          size="sm"
          disabled={saving}
          className="space-x-1.5 shadow-sm font-semibold"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Settings</span>
            </>
          )}
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center space-x-2 text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-2 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* 1. MAILGUN EMAIL CONFIGURATION CARD */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-royal/10 text-royal flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-navy">
                Mailgun Email Platform Configuration
              </h3>
              <p className="text-xs text-academic-muted">
                Configures real-time email delivery for manuscript submissions, peer reviews, and article publications.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-semibold text-teal bg-teal/10 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Service</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* MAILGUN_API_KEY */}
          <div className="md:col-span-2">
            <label className="block font-semibold text-academic-text mb-1">
              MAILGUN_API_KEY
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={mailgunApiKey}
                onChange={(e) => setMailgunApiKey(e.target.value)}
                placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-academic-muted hover:text-navy cursor-pointer"
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-academic-muted mt-1 block">
              Found in your Mailgun Dashboard under <strong>Settings &rarr; API Keys</strong> (Private API Key starting with <code>key-</code>).
            </span>
          </div>

          {/* MAILGUN_DOMAIN */}
          <div>
            <label className="block font-semibold text-academic-text mb-1">
              MAILGUN_DOMAIN
            </label>
            <Input
              value={mailgunDomain}
              onChange={(e) => setMailgunDomain(e.target.value)}
              placeholder="e.g. mg.yourjournaldomain.com"
              className="font-mono text-xs"
            />
            <span className="text-[10px] text-academic-muted mt-1 block">
              Your verified sending domain or sandbox domain from Mailgun.
            </span>
          </div>

          {/* MAILGUN_URL */}
          <div>
            <label className="block font-semibold text-academic-text mb-1">
              MAILGUN_URL (API Region / Endpoint)
            </label>
            <Input
              value={mailgunUrl}
              onChange={(e) => setMailgunUrl(e.target.value)}
              placeholder="https://api.mailgun.net"
              className="font-mono text-xs"
            />
            <span className="text-[10px] text-academic-muted mt-1 block">
              Default: <code>https://api.mailgun.net</code> (or <code>https://api.eu.mailgun.net</code> for EU accounts).
            </span>
          </div>

          {/* MAILGUN_FROM */}
          <div className="md:col-span-2">
            <label className="block font-semibold text-academic-text mb-1">
              MAILGUN_FROM (Sender Header)
            </label>
            <Input
              value={mailgunFrom}
              onChange={(e) => setMailgunFrom(e.target.value)}
              placeholder='"IJASR Editorial Office" <editorial@yourjournaldomain.com>'
              className="text-xs"
            />
            <span className="text-[10px] text-academic-muted mt-1 block">
              The display name and authorized email address authors see in their inbox.
            </span>
          </div>
        </div>

        {/* Live Test Email Tool */}
        <div className="pt-4 border-t border-gray-100">
          <div className="bg-gray-50/80 border border-academic-border/60 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy flex items-center space-x-1.5">
                <Send className="w-3.5 h-3.5 text-royal" />
                <span>Verify Mailgun Live Delivery</span>
              </span>
              <span className="text-[11px] text-academic-muted">
                Save settings first, then send a test message
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="text-xs bg-white flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={testingEmail}
                onClick={handleSendTestEmail}
                className="text-xs font-semibold shrink-0 cursor-pointer hover:bg-royal hover:text-white transition-colors"
              >
                {testingEmail ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    <span>Send Test Email</span>
                  </>
                )}
              </Button>
            </div>

            {testEmailResult && (
              <div
                className={`p-2.5 rounded-md text-xs flex items-center space-x-2 ${
                  testEmailResult.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {testEmailResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{testEmailResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. GENERAL JOURNAL METADATA CARD */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          General Journal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Journal Full Name *
            </label>
            <Input
              required
              value={journalName}
              onChange={(e) => setJournalName(e.target.value)}
              placeholder="International Journal of Advanced Scientific Research"
            />
          </div>

          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Short Name / Acronym
            </label>
            <Input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="IJASR"
            />
          </div>

          <div>
            <label className="block font-semibold text-academic-text mb-1">
              ISSN (Online / Print)
            </label>
            <Input
              value={issn}
              onChange={(e) => setIssn(e.target.value)}
              placeholder="2834-912X"
            />
          </div>

          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Publisher Name
            </label>
            <Input
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              placeholder="Apex Scholarly Publishing"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-academic-text mb-1">
              Publication Frequency
            </label>
            <Input
              value={publicationFrequency}
              onChange={(e) => setPublicationFrequency(e.target.value)}
              placeholder="Quarterly (4 issues per year)"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-academic-text mb-1">
              Journal Description & Aims
            </label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the journal's scholarly aims and disciplinary scope..."
            />
          </div>
        </div>
      </div>

      {/* 3. CONTACT & EDITORIAL ADDRESS CARD */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          Contact & Postal Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Official Journal Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editorial@journal.ac.org"
            />
          </div>

          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Phone Number
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-academic-text mb-1">
              Physical / Postal Address
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="100 Academic Way, Cambridge, MA 02138, USA"
            />
          </div>
        </div>
      </div>

      {/* 4. VISUAL IDENTITY & PALETTE */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="font-serif font-bold text-lg text-navy">
              Visual Identity, Official Logo & Palette
            </h3>
            <p className="text-xs text-academic-muted">
              Configure your journal emblem, header logo, and brand color theme.
            </p>
          </div>
        </div>

        {/* LOGO UPLOAD & LIVE DUAL PREVIEW */}
        <div className="space-y-4">
          <label className="block font-semibold text-academic-text text-xs">
            Official Journal Logo (PNG, SVG, JPG, WebP)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-academic-border rounded-xl p-5 text-center flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-royal/10 text-royal flex items-center justify-center mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-navy mb-1">
                Upload Journal Logo Image
              </p>
              <p className="text-[11px] text-academic-muted mb-4 max-w-xs leading-relaxed">
                Recommended: Transparent PNG or SVG (horizontal layout, min 250×60px). Auto-resized for fast loading.
              </p>
              <label className="inline-flex items-center justify-center px-4 py-2 bg-royal text-white rounded-lg text-xs font-semibold hover:bg-navy transition-colors cursor-pointer shadow-xs">
                <span>Choose Logo File</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {logo && (
                <button
                  type="button"
                  onClick={() => setLogo("")}
                  className="mt-3 text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Logo</span>
                </button>
              )}
            </div>

            {/* Live Dual Preview */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-academic-muted block uppercase tracking-wider">
                Live Previews (Light Navbar & Dark Footer/Sidebar)
              </span>

              {/* Light Background Preview (Navbar) */}
              <div className="border border-academic-border rounded-lg p-3.5 bg-white flex items-center justify-between shadow-2xs">
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 font-medium block mb-1">
                    Navbar Preview (Light Background):
                  </span>
                  {logo ? (
                    <img
                      src={logo}
                      alt="Journal Logo Preview"
                      className="h-10 w-auto max-w-[200px] object-contain"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-royal text-white flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-navy text-base leading-tight">
                          {shortName || "IJASR"}
                        </span>
                        <span className="text-[9px] text-academic-muted uppercase font-semibold">
                          Academic Journal
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                  {logo ? "Custom Logo" : "Default Badge"}
                </span>
              </div>

              {/* Dark Background Preview (Sidebar & Footer) */}
              <div className="border border-gray-700 rounded-lg p-3.5 bg-navy text-white flex items-center justify-between shadow-2xs">
                <div className="text-left">
                  <span className="text-[10px] text-gray-400 font-medium block mb-1">
                    Sidebar & Footer Preview (Dark Background):
                  </span>
                  {logo ? (
                    <div className="bg-white px-2.5 py-1.5 rounded-lg inline-flex items-center justify-center shadow-xs">
                      <img
                        src={logo}
                        alt="Journal Logo Preview Dark"
                        className="h-8.5 w-auto max-w-[170px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-royal text-white flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-white text-sm leading-tight">
                          {shortName || "IJASR"}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-semibold">
                          Editorial Portal
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Direct URL input */}
          <div className="pt-2">
            <label className="block text-[11px] font-medium text-academic-muted mb-1">
              Or specify logo image URL or file path:
            </label>
            <Input
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="e.g. /images/journal-logo.png or https://yourdomain.com/logo.png"
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Brand Palette Inputs */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Primary Brand Color (Navy)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#102A43"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-academic-text mb-1">
              Secondary Accent Color (Royal Blue)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#1769AA"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
