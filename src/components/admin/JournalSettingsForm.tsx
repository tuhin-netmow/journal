"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sliders, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JournalSettingsFormProps {
  initialSettings: any;
}

export function JournalSettingsForm({ initialSettings }: JournalSettingsFormProps) {
  const router = useRouter();

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

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update journal settings");
      }

      setSuccess("Journal settings updated successfully! Changes are live.");
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
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
            Configure global journal metadata, ISSN numbers, publisher identity, branding, and contact details.
          </p>
        </div>

        <Button type="submit" variant="teal" size="sm" disabled={saving} className="space-x-1.5 shadow-sm font-semibold">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center space-x-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Panel */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          General Journal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-semibold text-academic-text mb-1">
              Journal Name *
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
              ISSN Number
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

          <div>
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
              Journal Overview / Summary
            </label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the journal's mission and scope..."
            />
          </div>
        </div>
      </div>

      {/* Contact & Editorial Office */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          Editorial Office Contact Details
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

      {/* Visual Identity & Colors */}
      <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-5">
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
          Visual Identity & Palette
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
