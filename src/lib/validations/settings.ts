import { z } from "zod";

export const journalSettingsSchema = z.object({
  journalName: z.string().min(2, "Journal name is required"),
  shortName: z.string().optional(),
  issn: z.string().optional(),
  publisherName: z.string().optional(),
  description: z.string().optional(),
  publicationFrequency: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  paymentFee: z.coerce.number().min(0).optional(),
  paymentCurrency: z.string().optional(),
  paymentProvider: z.string().optional(),
  paymentLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  paymentQrCode: z.string().optional().or(z.literal("")),
  paymentInstructions: z.string().optional(),
});
