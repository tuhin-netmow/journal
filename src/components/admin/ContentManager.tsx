"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContentManagerProps {
  initialContents: any[];
}

export function ContentManager({ initialContents }: ContentManagerProps) {
  const router = useRouter();

  // Map initial contents by key
  const contentMap: Record<string, any> = {};
  initialContents.forEach((c) => {
    contentMap[c.pageKey] = c;
  });

  const [activeTab, setActiveTab] = useState<string>("homepage_hero");

  // State for all pages
  const [heroTitle, setHeroTitle] = useState(
    contentMap["homepage_hero"]?.title || "Advancing Research. Sharing Knowledge. Inspiring Innovation."
  );
  const [heroContent, setHeroContent] = useState(
    contentMap["homepage_hero"]?.content ||
      "A professional academic publishing platform dedicated to advancing scholarly research, upholding rigorous peer review standards, and promoting global knowledge sharing."
  );

  const [aboutOverview, setAboutOverview] = useState(
    contentMap["about_overview"]?.content || ""
  );

  const [aimsScope, setAimsScope] = useState(
    contentMap["aims_scope"]?.content || ""
  );

  const [missionObjectives, setMissionObjectives] = useState(
    contentMap["mission_objectives"]?.content || ""
  );

  const [peerReviewPolicy, setPeerReviewPolicy] = useState(
    contentMap["peer_review_policy"]?.content || ""
  );

  const [openAccessPolicy, setOpenAccessPolicy] = useState(
    contentMap["open_access_policy"]?.content || ""
  );

  const [publicationEthics, setPublicationEthics] = useState(
    contentMap["publication_ethics"]?.content || ""
  );

  const [copyrightLicensing, setCopyrightLicensing] = useState(
    contentMap["copyright_licensing"]?.content || ""
  );

  const [authorGuidelines, setAuthorGuidelines] = useState(
    contentMap["author_guidelines"]?.content || ""
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveTab = async (pageKey: string, title: string, content: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageKey, title, content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save content");
      }

      setSuccess("Page content saved successfully!");
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: "homepage_hero", label: "Homepage Hero" },
    { key: "about_overview", label: "About Overview" },
    { key: "aims_scope", label: "Aims & Scope" },
    { key: "mission_objectives", label: "Mission & Objectives" },
    { key: "peer_review_policy", label: "Peer Review Policy" },
    { key: "open_access_policy", label: "Open Access Policy" },
    { key: "publication_ethics", label: "Publication Ethics" },
    { key: "copyright_licensing", label: "Copyright & Licensing" },
    { key: "author_guidelines", label: "Author Guidelines" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-serif font-black text-2xl md:text-3xl text-navy">
          Website Content Management
        </h1>
        <p className="text-xs sm:text-sm text-academic-muted mt-0.5">
          Edit public textual content, editorial descriptions, mission statements, and journal policies.
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 bg-white p-3 rounded-xl border border-academic-border shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-academic-muted uppercase tracking-wider px-3 py-1.5 block">
            Sections
          </span>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-royal text-white shadow-sm"
                  : "text-academic-text hover:bg-academic-bg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Editor Panel */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-academic-border shadow-sm space-y-5">
          {activeTab === "homepage_hero" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Homepage Hero Banner
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Hero Heading *
                </label>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Advancing Research. Sharing Knowledge. Inspiring Innovation."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Hero Tagline / Description *
                </label>
                <Textarea
                  rows={4}
                  value={heroContent}
                  onChange={(e) => setHeroContent(e.target.value)}
                  placeholder="Journal description..."
                />
              </div>
              <Button
                onClick={() => handleSaveTab("homepage_hero", heroTitle, heroContent)}
                disabled={saving}
                variant="teal"
                size="sm"
                className="space-x-1.5 font-semibold"
              >
                <Save className="w-4 h-4" />
                <span>Save Hero Content</span>
              </Button>
            </div>
          )}

          {activeTab === "about_overview" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Journal Overview (About Page)
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Overview Content *
                </label>
                <Textarea
                  rows={8}
                  value={aboutOverview}
                  onChange={(e) => setAboutOverview(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("about_overview", "Journal Overview", aboutOverview)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Overview</span>
              </Button>
            </div>
          )}

          {activeTab === "aims_scope" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Aims and Scope
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Scope Content *
                </label>
                <Textarea
                  rows={8}
                  value={aimsScope}
                  onChange={(e) => setAimsScope(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("aims_scope", "Aims and Scope", aimsScope)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Aims & Scope</span>
              </Button>
            </div>
          )}

          {activeTab === "mission_objectives" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Mission & Objectives
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Mission Content *
                </label>
                <Textarea
                  rows={8}
                  value={missionObjectives}
                  onChange={(e) => setMissionObjectives(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("mission_objectives", "Mission and Objectives", missionObjectives)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Mission</span>
              </Button>
            </div>
          )}

          {activeTab === "peer_review_policy" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Peer Review Policy
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Policy Statement *
                </label>
                <Textarea
                  rows={8}
                  value={peerReviewPolicy}
                  onChange={(e) => setPeerReviewPolicy(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("peer_review_policy", "Peer Review Policy", peerReviewPolicy)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Peer Review Policy</span>
              </Button>
            </div>
          )}

          {activeTab === "open_access_policy" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Open Access Policy
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Policy Details *
                </label>
                <Textarea
                  rows={8}
                  value={openAccessPolicy}
                  onChange={(e) => setOpenAccessPolicy(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("open_access_policy", "Open Access Policy", openAccessPolicy)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Open Access Policy</span>
              </Button>
            </div>
          )}

          {activeTab === "publication_ethics" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Publication Ethics & Malpractice
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Ethics Statement *
                </label>
                <Textarea
                  rows={8}
                  value={publicationEthics}
                  onChange={(e) => setPublicationEthics(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("publication_ethics", "Publication Ethics & Malpractice", publicationEthics)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Ethics Policy</span>
              </Button>
            </div>
          )}

          {activeTab === "copyright_licensing" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Copyright and Licensing
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Licensing Terms *
                </label>
                <Textarea
                  rows={8}
                  value={copyrightLicensing}
                  onChange={(e) => setCopyrightLicensing(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("copyright_licensing", "Copyright and Licensing", copyrightLicensing)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Licensing</span>
              </Button>
            </div>
          )}

          {activeTab === "author_guidelines" && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-100">
                Author Guidelines Content
              </h3>
              <div>
                <label className="block text-xs font-semibold text-academic-text mb-1">
                  Guidelines Text *
                </label>
                <Textarea
                  rows={10}
                  value={authorGuidelines}
                  onChange={(e) => setAuthorGuidelines(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleSaveTab("author_guidelines", "Author Guidelines", authorGuidelines)}
                disabled={saving}
                variant="teal"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Author Guidelines</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
