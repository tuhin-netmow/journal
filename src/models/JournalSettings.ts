import mongoose, { Schema, Model, models } from "mongoose";
import { IJournalSettings } from "@/types";

const JournalSettingsSchema = new Schema<IJournalSettings>(
  {
    journalName: { type: String, required: true, default: "International Journal of Advanced Scientific Research" },
    shortName: { type: String, default: "IJASR" },
    issn: { type: String, default: "2834-912X" },
    publisherName: { type: String, default: "Apex Scholarly Publishing" },
    description: {
      type: String,
      default:
        "A peer-reviewed, open-access international journal dedicated to publishing cutting-edge scholarly research across science, technology, engineering, and interdisciplinary studies.",
    },
    publicationFrequency: { type: String, default: "Quarterly (4 issues per year)" },
    email: { type: String, default: "editorial@journal.ac.org" },
    phone: { type: String, default: "+1 (555) 234-5678" },
    address: { type: String, default: "100 Academic Way, Cambridge, MA 02138, USA" },
    logo: { type: String },
    primaryColor: { type: String, default: "#102A43" },
    secondaryColor: { type: String, default: "#1769AA" },
    paymentFee: { type: Number, default: 350 },
    paymentCurrency: { type: String, default: "USD" },
    paymentProvider: { type: String, default: "Stripe / PayPal External Link" },
    paymentLink: { type: String, default: "https://buy.stripe.com/demo-journal-apc" },
    paymentQrCode: { type: String },
    paymentInstructions: {
      type: String,
      default:
        "Please include your Submission ID (e.g. MS-2026-XXXX) as the payment reference or note during checkout. After completing the payment, our editorial office will manually verify the transaction within 24-48 business hours.",
    },
    mailgunApiKey: { type: String, default: "" },
    mailgunDomain: { type: String, default: "" },
    mailgunUrl: { type: String, default: "https://api.mailgun.net" },
    mailgunFrom: { type: String, default: '"IJASR Editorial Office" <editorial@journal.ac.org>' },
  },
  { timestamps: true, strict: false }
);

// Delete cached model in dev mode so schema updates are never blocked by HMR cache
if (process.env.NODE_ENV !== "production" && mongoose.models.JournalSettings) {
  delete (mongoose.models as any).JournalSettings;
}

const JournalSettings: Model<IJournalSettings> =
  models.JournalSettings ||
  mongoose.model<IJournalSettings>("JournalSettings", JournalSettingsSchema);
export default JournalSettings;
