"use client";

import React, { useState } from "react";
import { Upload, Plus, Trash2, CheckCircle2, AlertCircle, FileText, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CoAuthor {
  name: string;
  affiliation: string;
}

export function ManuscriptSubmissionForm() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    submissionId: string;
    message: string;
  } | null>(null);

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorPhone, setAuthorPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");

  const [title, setTitle] = useState("");
  const [manuscriptType, setManuscriptType] = useState("Research Article");
  const [category, setCategory] = useState("Computer Science & AI");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");

  const [coAuthors, setCoAuthors] = useState<CoAuthor[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Checkboxes
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const [confirmNotSubmitted, setConfirmNotSubmitted] = useState(false);
  const [confirmGuidelines, setConfirmGuidelines] = useState(false);
  const [confirmConsent, setConfirmConsent] = useState(false);

  const addCoAuthor = () => {
    setCoAuthors([...coAuthors, { name: "", affiliation: "" }]);
  };

  const removeCoAuthor = (index: number) => {
    setCoAuthors(coAuthors.filter((_, i) => i !== index));
  };

  const updateCoAuthor = (index: number, field: "name" | "affiliation", value: string) => {
    const updated = [...coAuthors];
    updated[index][field] = value;
    setCoAuthors(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMessage("Please select a valid PDF file.");
        setPdfFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File exceeds 10 MB limit.");
        setPdfFile(null);
        return;
      }
      setErrorMessage(null);
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend checks
    if (!pdfFile) {
      setErrorMessage("Please upload your manuscript PDF file.");
      return;
    }

    if (!confirmOriginal || !confirmNotSubmitted || !confirmGuidelines || !confirmConsent) {
      setErrorMessage("You must accept all author declarations to proceed.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("pdfFile", pdfFile);
      formData.append("authorName", authorName);
      formData.append("authorEmail", authorEmail);
      if (authorPhone) formData.append("authorPhone", authorPhone);
      formData.append("institution", institution);
      if (department) formData.append("department", department);
      formData.append("country", country);

      formData.append("title", title);
      formData.append("manuscriptType", manuscriptType);
      formData.append("category", category);
      formData.append("abstract", abstract);
      formData.append("keywords", keywords);

      const validCoAuthors = coAuthors.filter((ca) => ca.name.trim() !== "");
      formData.append("coAuthors", JSON.stringify(validCoAuthors));

      formData.append("confirmOriginal", "true");
      formData.append("confirmNotSubmitted", "true");
      formData.append("confirmGuidelines", "true");
      formData.append("confirmConsent", "true");

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please check inputs.");
      }

      setSubmissionSuccess({
        submissionId: data.submissionId,
        message: data.message,
      });
      toast.success(`Manuscript submitted successfully! Ref: ${data.submissionId}`);
    } catch (err: any) {
      const msg = err.message || "Failed to submit manuscript.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="bg-white rounded-xl border border-academic-border p-8 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-serif font-bold text-2xl text-navy mb-2">
          Submission Received Successfully!
        </h3>
        <p className="text-academic-muted mb-6 leading-relaxed">
          {submissionSuccess.message}
        </p>

        <div className="bg-academic-bg border border-academic-border rounded-lg p-5 mb-8 text-left">
          <div className="text-xs uppercase tracking-wider text-academic-muted font-bold mb-1">
            Manuscript Reference ID
          </div>
          <div className="text-2xl font-mono font-bold text-royal mb-3">
            {submissionSuccess.submissionId}
          </div>
          <p className="text-xs text-academic-muted leading-relaxed">
            Please retain this reference number for all future inquiries regarding your submission. A confirmation email has been logged to our editorial intake desk.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSubmissionSuccess(null);
              setPdfFile(null);
              setTitle("");
              setAbstract("");
              setKeywords("");
              setCoAuthors([]);
            }}
          >
            Submit Another Manuscript
          </Button>
          <Button href="/" variant="teal">
            Return to Journal Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl border border-academic-border shadow-sm max-w-4xl mx-auto">
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: Corresponding Author Information */}
      <div>
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-200 mb-4">
          1. Corresponding Author Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Full Name *
            </label>
            <Input
              required
              placeholder="e.g. Prof. David K. Miller, Ph.D."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Email Address *
            </label>
            <Input
              type="email"
              required
              placeholder="author@institution.edu"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Phone Number (Optional)
            </label>
            <Input
              placeholder="+1 (555) 000-0000"
              value={authorPhone}
              onChange={(e) => setAuthorPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Country *
            </label>
            <Input
              required
              placeholder="e.g. United States, Germany, Japan"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Institution / University *
            </label>
            <Input
              required
              placeholder="e.g. Massachusetts Institute of Technology"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Department (Optional)
            </label>
            <Input
              placeholder="e.g. Department of Mechanical Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Manuscript Metadata */}
      <div>
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-200 mb-4">
          2. Manuscript Metadata
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Manuscript Title *
            </label>
            <Input
              required
              placeholder="Enter complete scholarly title of the article"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-academic-text mb-1.5">
                Manuscript Type *
              </label>
              <select
                className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
                value={manuscriptType}
                onChange={(e) => setManuscriptType(e.target.value)}
              >
                <option value="Research Article">Research Article</option>
                <option value="Review Article">Review Article</option>
                <option value="Short Communication">Short Communication</option>
                <option value="Case Study">Case Study</option>
                <option value="Methodology Paper">Methodology Paper</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-academic-text mb-1.5">
                Research Category *
              </label>
              <select
                className="w-full h-10 rounded-md border border-academic-border bg-white px-3 py-2 text-sm text-academic-text focus:outline-none focus:ring-2 focus:ring-royal"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Computer Science & AI">Computer Science & AI</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Materials Science">Materials Science</option>
                <option value="Biomedical Sciences">Biomedical Sciences</option>
                <option value="Environmental Sciences">Environmental Sciences</option>
                <option value="Applied Physics">Applied Physics</option>
                <option value="Robotics & Automation">Robotics & Automation</option>
                <option value="General Science">General Science</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Abstract (Minimum 50 characters) *
            </label>
            <Textarea
              required
              rows={5}
              placeholder="Provide a comprehensive academic abstract detailing background, objectives, methodologies, findings, and conclusions..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
            <span className="text-[11px] text-academic-muted">
              Current length: {abstract.length} characters
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-academic-text mb-1.5">
              Keywords (Comma separated) *
            </label>
            <Input
              required
              placeholder="e.g. Machine Learning, Deep Neural Networks, Image Classification"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Co-Authors */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-4">
          <h3 className="font-serif font-bold text-lg text-navy">
            3. Co-Authors (Optional)
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCoAuthor}
            className="space-x-1.5 text-xs text-royal border-royal/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Co-Author</span>
          </Button>
        </div>

        {coAuthors.length === 0 ? (
          <p className="text-xs text-academic-muted italic">
            No co-authors added. If you are the sole author, you can proceed directly to file upload.
          </p>
        ) : (
          <div className="space-y-3">
            {coAuthors.map((ca, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-academic-bg rounded-lg border border-gray-200"
              >
                <Input
                  placeholder="Co-Author Full Name"
                  value={ca.name}
                  onChange={(e) => updateCoAuthor(index, "name", e.target.value)}
                  className="sm:w-1/2"
                />
                <Input
                  placeholder="Affiliation / University"
                  value={ca.affiliation}
                  onChange={(e) => updateCoAuthor(index, "affiliation", e.target.value)}
                  className="sm:w-1/2"
                />
                <button
                  type="button"
                  onClick={() => removeCoAuthor(index)}
                  className="text-rose-600 hover:text-rose-800 p-2"
                  title="Remove co-author"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: PDF Manuscript File Upload */}
      <div>
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-200 mb-4">
          4. Upload Manuscript PDF *
        </h3>
        <div className="border-2 border-dashed border-academic-border rounded-xl p-8 text-center bg-academic-bg hover:border-royal transition-colors">
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="pdf-upload" className="cursor-pointer block">
            <div className="w-12 h-12 bg-royal/10 text-royal rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-royal hover:underline block mb-1">
              {pdfFile ? "Click to change manuscript PDF" : "Click to select or drag manuscript PDF here"}
            </span>
            <span className="text-xs text-academic-muted block">
              PDF files only • Maximum file size: 10 MB
            </span>
          </label>

          {pdfFile && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-academic-border shadow-sm text-xs font-medium text-academic-text">
              <FileText className="w-4 h-4 text-royal" />
              <span>{pdfFile.name}</span>
              <span className="text-academic-muted">
                ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: Author Declarations */}
      <div>
        <h3 className="font-serif font-bold text-lg text-navy pb-2 border-b border-gray-200 mb-4">
          5. Author Warranties & Declarations
        </h3>
        <div className="space-y-3">
          <label className="flex items-start space-x-3 text-xs text-academic-text cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmOriginal}
              onChange={(e) => setConfirmOriginal(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-royal focus:ring-royal"
            />
            <span>
              <strong>Original Work Confirmation:</strong> I confirm that this manuscript represents original research conducted by the listed authors, contains no plagiarized material, and proper citations are provided for all referenced sources.
            </span>
          </label>

          <label className="flex items-start space-x-3 text-xs text-academic-text cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmNotSubmitted}
              onChange={(e) => setConfirmNotSubmitted(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-royal focus:ring-royal"
            />
            <span>
              <strong>Exclusivity Warranty:</strong> I warrant that this manuscript has not been published previously and is not currently under formal review or consideration with any other journal or conference proceedings.
            </span>
          </label>

          <label className="flex items-start space-x-3 text-xs text-academic-text cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmGuidelines}
              onChange={(e) => setConfirmGuidelines(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-royal focus:ring-royal"
            />
            <span>
              <strong>Author Guidelines Agreement:</strong> I have prepared this manuscript in compliance with the IJASR Author Guidelines, including formatting, ethics standards, and reference styling.
            </span>
          </label>

          <label className="flex items-start space-x-3 text-xs text-academic-text cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmConsent}
              onChange={(e) => setConfirmConsent(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-royal focus:ring-royal"
            />
            <span>
              <strong>Privacy & Processing Consent:</strong> I consent to the processing of personal and manuscript data by the editorial office solely for evaluation, peer review, and publishing workflows.
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          type="submit"
          size="lg"
          variant="teal"
          disabled={submitting}
          className="w-full sm:w-auto px-8 space-x-2 font-semibold shadow-md"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Validating & Uploading Manuscript...</span>
            </>
          ) : (
            <>
              <span>Submit Manuscript Now</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
