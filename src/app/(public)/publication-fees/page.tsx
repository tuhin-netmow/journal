import React from "react";
import connectToDatabase from "@/lib/mongodb";
import JournalSettings from "@/models/JournalSettings";
import {
  CreditCard,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Smartphone,
  Lock,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/utils";

export const metadata = {
  title: "Publication Fees",
  description: "Information regarding Article Processing Charges (APC), payment methods, waivers, and external payment links.",
};

export const revalidate = 0;

export default async function PublicationFeesPage() {
  await connectToDatabase();
  const settings: any = (await JournalSettings.findOne().lean()) || {};

  const fee = settings.paymentFee !== undefined ? settings.paymentFee : 350;
  const currency = settings.paymentCurrency || "USD";
  const currencySymbol = getCurrencySymbol(currency);
  const provider = settings.paymentProvider || "External Scholarly Payment Portal";
  const paymentLink = settings.paymentLink || "https://buy.stripe.com/demo-journal-apc";
  const customQrCode = settings.paymentQrCode || "";
  const instructions =
    settings.paymentInstructions ||
    "Please include your Manuscript Reference ID (e.g. MS-2026-XXXX) as the transaction note during checkout. After completing payment, our editorial office will manually verify the payment within 24-48 business hours.";

  // Generate QR code data URL from paymentLink if custom QR code not uploaded
  let qrCodeDataUrl = customQrCode;
  if (!qrCodeDataUrl && paymentLink && paymentLink.trim().startsWith("http")) {
    try {
      qrCodeDataUrl = await QRCode.toDataURL(paymentLink.trim(), {
        width: 360,
        margin: 2,
        color: {
          dark: "#102A43",
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error("Failed to generate payment QR code:", err);
    }
  }

  return (
    <div className="py-12 bg-academic-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="border-b border-academic-border pb-8 text-center sm:text-left">
          <span className="text-xs uppercase font-bold text-royal tracking-wider">
            Open Access Sustainability
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-1">
            Publication Fees (APC)
          </h1>
          <p className="text-academic-muted text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            As an open-access journal, IJASR does not charge subscription fees to readers. Article Processing Charges support editorial operations, archiving, and digital infrastructure.
          </p>
        </div>

        {/* Pricing Card Highlight with QR Code & Payment Link */}
        <div className="bg-white rounded-2xl border border-academic-border p-8 md:p-10 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          {/* Fee Information (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-xs uppercase font-bold text-teal tracking-wider">
              Standard Article Processing Charge
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="font-serif font-black text-4xl sm:text-5xl text-navy">
                {currencySymbol && currencySymbol !== currency
                  ? (currencySymbol.length > 1 ? `${currencySymbol} ` : currencySymbol)
                  : ""}
                {fee}
              </span>
              <span className="text-sm font-bold text-academic-muted uppercase">
                {currency}
              </span>
            </div>
            <p className="text-xs text-academic-muted leading-relaxed">
              Applicable only after formal acceptance following peer review. There are no submission fees, and no charges for rejected manuscripts.
            </p>

            <div className="pt-2 space-y-2 text-xs text-academic-text">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                <span>Immediate universal open access under CC BY 4.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                <span>Permanent DOI assignment and long-term digital preservation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
                <span>Full professional typesetting and layout formatting</span>
              </div>
            </div>
          </div>

          {/* Action Box with QR Code & External Payment Link (2 cols) */}
          <div className="md:col-span-2 bg-academic-bg rounded-xl border border-academic-border p-6 text-center space-y-4 flex flex-col items-center justify-between shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-navy">
                <CreditCard className="w-4 h-4 text-royal" />
                <span>{provider}</span>
              </div>
              <span className="text-[10px] text-academic-muted block">
                Official Gateway Checkout
              </span>
            </div>

            {/* Clickable QR Code for scanning or desktop click */}
            {qrCodeDataUrl ? (
              <div className="space-y-2 flex flex-col items-center w-full">
                <a
                  href={paymentLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block p-2.5 bg-white rounded-xl border border-academic-border hover:border-royal hover:shadow-md transition-all cursor-pointer"
                  title="Scan with phone camera or click to open checkout"
                >
                  <img
                    src={qrCodeDataUrl}
                    alt="Payment QR Code - Scan to Pay"
                    className="w-40 h-40 object-contain rounded-lg mx-auto"
                  />
                  <div className="absolute inset-0 bg-navy/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold space-y-1 p-2">
                    <ExternalLink className="w-5 h-5 text-teal" />
                    <span>Open Payment Link</span>
                  </div>
                </a>

                <div className="flex items-center justify-center space-x-1 text-[11px] text-teal font-semibold bg-teal/10 px-2.5 py-1 rounded-full">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Scan with phone camera to pay</span>
                </div>
              </div>
            ) : null}

            {/* Button Link */}
            <div className="w-full space-y-2">
              {paymentLink ? (
                <Button
                  href={paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="teal"
                  className="w-full space-x-2 font-semibold shadow-md"
                >
                  <span>Pay Publication Fee</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              ) : (
                <Button disabled variant="outline" className="w-full">
                  Payment Link Pending
                </Button>
              )}

              <span className="text-[10px] text-academic-muted flex items-center justify-center space-x-1">
                <Lock className="w-3 h-3 text-academic-muted" />
                <span>Redirects to secure external gateway</span>
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions & Manual Verification Policy */}
        <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-xl text-navy flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-royal" />
            <span>Payment Instructions & Verification</span>
          </h3>

          <div className="bg-academic-bg p-5 rounded-lg border border-gray-200 text-xs sm:text-sm text-academic-text leading-relaxed whitespace-pre-line">
            {instructions}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> IJASR does not automatically process or capture credit card details on this website. All transactions occur via the authorized external payment link or QR code above, and payments are verified manually by the editorial team.
            </p>
          </div>
        </section>

        {/* Waiver Policy */}
        <section className="bg-white rounded-xl border border-academic-border p-8 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-xl text-navy">
            Fee Waivers and Discounts
          </h3>
          <p className="text-xs sm:text-sm text-academic-text/90 leading-relaxed">
            IJASR offers full and partial APC waivers to corresponding authors from low-income and lower-middle-income economies as designated by the World Bank. Authors seeking a financial waiver should state their request in the comments or contact the editorial office before submitting their work.
          </p>
        </section>
      </div>
    </div>
  );
}
