"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Layers,
  FileText,
  Plus,
  X,
  RotateCcw,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getApiResponseError, getErrorMessage } from "@/lib/utils";
import { DEFAULT_CATEGORIES, DEFAULT_MANUSCRIPT_TYPES } from "@/lib/constants";

interface JournalSettingsFormProps {
  initialSettings: any;
  initialTab?: string;
}

export function JournalSettingsForm({
  initialSettings,
  initialTab = "general",
}: JournalSettingsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Active Tab State (synchronized with URL query & hash)
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    // 1. Sync from URL search params (?tab=...)
    const tabParam = searchParams.get("tab");
    if (tabParam && ["general", "taxonomy", "mailgun", "branding", "contact"].includes(tabParam)) {
      setActiveTab(tabParam);
      return;
    }

    // 2. Sync from URL hash (#...)
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["general", "taxonomy", "mailgun", "branding", "contact"].includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleHashChange = () => {
        const hash = window.location.hash.replace("#", "");
        if (hash && ["general", "taxonomy", "mailgun", "branding", "contact"].includes(hash)) {
          setActiveTab(hash);
        }
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, []);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/admin/settings?tab=${tabId}#${tabId}`);
    }
  };

  // Taxonomy Management: Categories & Manuscript Types
  const [categories, setCategories] = useState<string[]>(
    initialSettings.categories && initialSettings.categories.length > 0
      ? initialSettings.categories
      : DEFAULT_CATEGORIES
  );
  const [newCategory, setNewCategory] = useState("");

  const [manuscriptTypes, setManuscriptTypes] = useState<string[]>(
    initialSettings.manuscriptTypes && initialSettings.manuscriptTypes.length > 0
      ? initialSettings.manuscriptTypes
      : DEFAULT_MANUSCRIPT_TYPES
  );
  const [newManuscriptType, setNewManuscriptType] = useState("");

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already exists.`);
      return;
    }
    setCategories([...categories, trimmed]);
    setNewCategory("");
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (categories.length <= 1) {
      toast.error("At least one research category is required.");
      return;
    }
    setCategories(categories.filter((c) => c !== catToRemove));
  };

  const handleResetCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
    toast.info("Research categories reset to defaults.");
  };

  const handleAddManuscriptType = () => {
    const trimmed = newManuscriptType.trim();
    if (!trimmed) return;
    if (manuscriptTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Manuscript type "${trimmed}" already exists.`);
      return;
    }
    setManuscriptTypes([...manuscriptTypes, trimmed]);
    setNewManuscriptType("");
  };

  const handleManuscriptTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddManuscriptType();
    }
  };

  const handleRemoveManuscriptType = (typeToRemove: string) => {
    if (manuscriptTypes.length <= 1) {
      toast.error("At least one manuscript type is required.");
      return;
    }
    setManuscriptTypes(manuscriptTypes.filter((t) => t !== typeToRemove));
  };

  const handleResetManuscriptTypes = () => {
    setManuscriptTypes(DEFAULT_MANUSCRIPT_TYPES);
    toast.info("Manuscript types reset to defaults.");
  };

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

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to send test email");
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const msg = data.message || `Test email successfully sent to ${testEmail}!`;
      setTestEmailResult({
        success: true,
        message: msg,
      });
      toast.success(msg);
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "Failed to deliver test email.");
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
    if (!journalName.trim()) {
      setActiveTab("general");
      setError("Journal Full Name is required.");
      toast.error("Journal Full Name is required.");
      return;
    }

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
          categories,
          manuscriptTypes,
          mailgunApiKey: mailgunApiKey.trim(),
          mailgunDomain: mailgunDomain.trim(),
          mailgunUrl: mailgunUrl.trim(),
          mailgunFrom: mailgunFrom.trim(),
        }),
      });

      if (!res.ok) {
        const errorMsg = await getApiResponseError(res, "Failed to update journal settings");
        throw new Error(errorMsg);
      }

      await res.json();

      setSuccess("Journal & Mailgun settings updated successfully! Changes are live.");
      toast.success("Journal & Mailgun settings updated successfully!");
      router.refresh();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      const errMsg = getErrorMessage(err, "Failed to update settings.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const renderSaveFooter = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-gray-100 mt-6">
      <p className="text-xs text-academic-muted">
        Save changes to update journal configurations across the platform.
      </p>
      <Button
        type="submit"
        variant="teal"
        size="sm"
        disabled={saving}
        className="space-x-1.5 shadow-sm font-semibold cursor-pointer shrink-0 self-end sm:self-auto"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </>
        )}
      </Button>
    </div>
  );

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

      {/* Tab Navigation */}
      <div className="bg-academic-bg border border-academic-border p-1.5 rounded-xl flex flex-wrap gap-1.5 shadow-2xs">
        {[
          { id: "general", label: "General Identity", icon: BookOpen },
          {
            id: "taxonomy",
            label: "Categories & Types",
            icon: Tag,
            count: categories.length + manuscriptTypes.length,
          },
          { id: "mailgun", label: "Email Platform", icon: Mail },
          { id: "branding", label: "Branding & Logo", icon: ImageIcon },
          { id: "contact", label: "Contact & Postal", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-navy shadow-xs border border-academic-border font-bold"
                  : "text-academic-muted hover:text-navy hover:bg-white/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-teal" : "text-academic-muted"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                    isActive
                      ? "bg-teal/10 text-teal-dark"
                      : "bg-gray-200 text-academic-muted"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAILGUN EMAIL CONFIGURATION TAB */}
      {activeTab === "mailgun" && (
        <div id="mailgun" className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5 scroll-mt-20">
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

        {renderSaveFooter()}
      </div>
      )}

      {/* GENERAL JOURNAL METADATA TAB */}
      {activeTab === "general" && (
        <div id="general" className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5 scroll-mt-20">
          <div className="pb-3 border-b border-gray-100 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy/10 text-navy flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-navy">
                General Journal Information
              </h3>
              <p className="text-xs text-academic-muted">
                Official journal name, ISSN identification, publisher identity, and disciplinary scope.
              </p>
            </div>
          </div>

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

        {renderSaveFooter()}
      </div>
      )}

      {/* CONTACT & EDITORIAL ADDRESS TAB */}
      {activeTab === "contact" && (
        <div id="contact" className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5 scroll-mt-20">
          <div className="pb-3 border-b border-gray-100 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-royal/10 text-royal flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-navy">
                Contact &amp; Postal Details
              </h3>
              <p className="text-xs text-academic-muted">
                Official public contact channels and editorial office location.
              </p>
            </div>
          </div>

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

          {renderSaveFooter()}
        </div>
      )}

      {/* VISUAL IDENTITY & BRANDING TAB */}
      {activeTab === "branding" && (
        <div id="branding" className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-royal/10 text-royal flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-navy">
                  Visual Identity, Official Logo & Palette
                </h3>
                <p className="text-xs text-academic-muted">
                  Configure your journal emblem, header logo, and brand color theme.
                </p>
              </div>
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

        {renderSaveFooter()}
      </div>
      )}

      {/* TAXONOMY TAB */}
      {activeTab === "taxonomy" && (
        <div id="taxonomy" className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-6 scroll-mt-20">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-navy">
                Taxonomy: Research Categories &amp; Manuscript Types
              </h3>
              <p className="text-xs text-academic-muted">
                Manage the research categories and manuscript article types available to authors during submission and editors during publication.
              </p>
            </div>
          </div>
        </div>

        {/* Section A: Research Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                Research Categories ({categories.length})
              </label>
              <p className="text-[11px] text-academic-muted">
                These categories appear in manuscript submission dropdowns and article category filters.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetCategories}
              className="text-xs text-academic-muted hover:text-navy space-x-1 h-7 px-2 cursor-pointer"
              title="Reset to academic defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </Button>
          </div>

          {/* Current Categories Badges */}
          <div className="flex flex-wrap gap-2 p-3 bg-academic-bg border border-academic-border rounded-lg min-h-[50px] items-center">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-teal/30 text-teal-dark text-xs font-medium shadow-xs"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-academic-muted hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                  title={`Remove "${cat}"`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Category Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter new research category (e.g. Artificial Intelligence, Renewable Energy)..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={handleCategoryKeyDown}
              className="text-xs"
            />
            <Button
              type="button"
              variant="teal"
              size="sm"
              onClick={handleAddCategory}
              className="shrink-0 space-x-1 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 my-4" />

        {/* Section B: Manuscript Types */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                Manuscript Types ({manuscriptTypes.length})
              </label>
              <p className="text-[11px] text-academic-muted">
                Scholarly manuscript formats accepted by the editorial desk (e.g. Research Article, Review Article).
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetManuscriptTypes}
              className="text-xs text-academic-muted hover:text-navy space-x-1 h-7 px-2 cursor-pointer"
              title="Reset to academic defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </Button>
          </div>

          {/* Current Manuscript Types Badges */}
          <div className="flex flex-wrap gap-2 p-3 bg-academic-bg border border-academic-border rounded-lg min-h-[50px] items-center">
            {manuscriptTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white border border-royal/30 text-royal text-xs font-medium shadow-xs"
              >
                <FileText className="w-3 h-3 text-royal/60" />
                <span>{type}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveManuscriptType(type)}
                  className="text-academic-muted hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                  title={`Remove "${type}"`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Manuscript Type Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter new manuscript type (e.g. Commentary, Perspective, Protocol)..."
              value={newManuscriptType}
              onChange={(e) => setNewManuscriptType(e.target.value)}
              onKeyDown={handleManuscriptTypeKeyDown}
              className="text-xs"
            />
            <Button
              type="button"
              variant="royal"
              size="sm"
              onClick={handleAddManuscriptType}
              className="shrink-0 space-x-1 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Type</span>
            </Button>
          </div>
        </div>

        {renderSaveFooter()}
      </div>
      )}
    </form>
  );
}
