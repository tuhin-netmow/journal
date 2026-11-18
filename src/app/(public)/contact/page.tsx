import React from "react";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with the editorial board, publishing office, or technical support team of IJASR.",
};

export const revalidate = 0;

export default async function ContactPage() {
  await connectToDatabase();
  const settings: any = (await JournalSettings.findOne().lean()) || {};

  const email = settings.email || "editorial@journal.ac.org";
  const phone = settings.phone || "+1 (555) 234-5678";
  const address = settings.address || "100 Academic Way, Cambridge, MA 02138, USA";

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-academic-border pb-8 text-center sm:text-left">
          <span className="text-xs uppercase font-bold text-royal tracking-wider">
            Editorial Communications
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-1">
            Contact the Editorial Office
          </h1>
          <p className="text-academic-muted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Have questions regarding manuscript submissions, special issues, or institutional subscriptions? We are here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-academic-border p-6 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-lg text-navy pb-3 border-b border-gray-100">
                Editorial Office Details
              </h3>

              <div className="space-y-4 text-xs text-academic-text">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-royal/10 text-royal flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-navy block">Postal Address</span>
                    <span className="text-academic-muted leading-relaxed block mt-0.5">
                      {address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-navy block">Email Correspondence</span>
                    <a href={`mailto:${email}`} className="text-royal hover:underline block mt-0.5">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-navy block">Telephone Support</span>
                    <span className="text-academic-muted block mt-0.5">{phone}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-navy block">Office Operating Hours</span>
                    <span className="text-academic-muted block mt-0.5">
                      Monday – Friday: 09:00 – 17:00 EST
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
