import React from "react";
import { ManuscriptSubmissionForm } from "@/components/forms/ManuscriptSubmissionForm";
import { FileCheck, Shield, Clock, Send } from "lucide-react";

export const metadata = {
  title: "Submit Manuscript",
  description: "Submit your scholarly research manuscript online to IJASR. No registration or author account required.",
};

export default function SubmitManuscriptPage() {
  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-bold text-teal tracking-wider bg-teal/10 px-3 py-1 rounded-full border border-teal/20">
            Open Submissions
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy">
            Submit Your Manuscript
          </h1>
          <p className="text-academic-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Welcome to the IJASR submission portal. Authors can submit original research directly without prior account registration.
          </p>
        </div>

        {/* Informational Guidance Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-academic-border flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-royal/10 text-royal flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-navy">PDF Manuscripts Only</div>
              <div className="text-academic-muted">Up to 10 MB per file</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-academic-border flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-navy">Continuous Intake</div>
              <div className="text-academic-muted">Screening in 3-5 days</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-academic-border flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-navy">Double-Blind Review</div>
              <div className="text-academic-muted">Objective evaluation</div>
            </div>
          </div>
        </div>

        {/* Main Submission Form */}
        <ManuscriptSubmissionForm />
      </div>
    </div>
  );
}
