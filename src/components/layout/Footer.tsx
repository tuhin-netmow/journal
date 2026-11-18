import React from "react";
import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin, ExternalLink, ShieldCheck } from "lucide-react";

interface FooterProps {
  settings?: any;
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const journalName = settings?.journalName || "International Journal of Advanced Scientific Research";
  const publisher = settings?.publisherName || "Apex Scholarly Publishing";
  const issn = settings?.issn || "2834-912X";
  const email = settings?.email || "editorial@journal.ac.org";
  const phone = settings?.phone || "+1 (555) 234-5678";
  const address = settings?.address || "100 Academic Way, Cambridge, MA 02138, USA";
  const frequency = settings?.publicationFrequency || "Quarterly (4 issues per year)";

  return (
    <footer className="bg-navy text-white pt-16 pb-10 border-t-4 border-royal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About Journal */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-royal flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">IJASR</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {journalName} is an open-access, peer-reviewed international forum for disseminating groundbreaking scholarly research across multidisciplinary domains.
            </p>
            <div className="space-y-1 text-xs text-gray-300">
              <p><strong className="text-white">ISSN:</strong> {issn}</p>
              <p><strong className="text-white">Publisher:</strong> {publisher}</p>
              <p><strong className="text-white">Frequency:</strong> {frequency}</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-lg text-white border-b border-gray-700 pb-2">
              Explore Publications
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/current-issue" className="hover:text-teal transition-colors">
                  Current Issue
                </Link>
              </li>
              <li>
                <Link href="/archives" className="hover:text-teal transition-colors">
                  Journal Archives & Volumes
                </Link>
              </li>
              <li>
                <Link href="/editorial-board" className="hover:text-teal transition-colors">
                  Editorial Board & Reviewers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-teal transition-colors">
                  Aims & Scope
                </Link>
              </li>
              <li>
                <Link href="/author-guidelines" className="hover:text-teal transition-colors">
                  Peer Review Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Authors */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-lg text-white border-b border-gray-700 pb-2">
              For Authors
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/submit-manuscript" className="hover:text-teal transition-colors font-medium text-teal-light">
                  Submit Online Manuscript →
                </Link>
              </li>
              <li>
                <Link href="/author-guidelines" className="hover:text-teal transition-colors">
                  Author Guidelines & Templates
                </Link>
              </li>
              <li>
                <Link href="/publication-fees" className="hover:text-teal transition-colors">
                  Article Processing Charges (APC)
                </Link>
              </li>
              <li>
                <Link href="/about#ethics" className="hover:text-teal transition-colors">
                  Publication Ethics & Plagiarism
                </Link>
              </li>
              <li>
                <Link href="/about#open-access" className="hover:text-teal transition-colors">
                  Open Access & CC BY 4.0 License
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-lg text-white border-b border-gray-700 pb-2">
              Editorial Office
            </h4>
            <div className="space-y-2.5 text-sm text-gray-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-royal-light mt-0.5 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-royal-light shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline">{email}</a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-royal-light shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="pt-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-royal/20 border border-royal/40 rounded text-xs text-royal-light">
                  <ShieldCheck className="w-4 h-4" />
                  <span>COPE Aligned Standards</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>
            © {currentYear} {journalName}. Published by {publisher}. All articles published under Creative Commons Attribution 4.0 (CC BY 4.0).
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="hover:text-gray-200 transition-colors">
              Staff Portal
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gray-200 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
