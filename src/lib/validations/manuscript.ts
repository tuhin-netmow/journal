import { z } from "zod";

export const manuscriptSubmissionSchema = z.object({
  authorName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  authorEmail: z.string().email("Please enter a valid email address"),
  authorPhone: z.string().max(30).optional().or(z.literal("")),
  institution: z.string().min(2, "Institution name is required").max(150),
  department: z.string().max(100).optional().or(z.literal("")),
  country: z.string().min(2, "Country is required").max(100),

  title: z.string().min(5, "Manuscript title must be at least 5 characters").max(300),
  manuscriptType: z.string().min(1, "Please select manuscript type"),
  category: z.string().min(1, "Please select research category"),
  abstract: z.string().min(50, "Abstract must be at least 50 characters").max(5000),
  keywords: z.union([z.string(), z.array(z.string())]),
  coAuthors: z
    .array(
      z.object({
        name: z.string().min(1, "Co-author name is required"),
        affiliation: z.string().optional(),
      })
    )
    .optional()
    .default([]),

  // Author declarations
  confirmOriginal: z.boolean().refine((val) => val === true, {
    message: "You must confirm this is your original work",
  }),
  confirmNotSubmitted: z.boolean().refine((val) => val === true, {
    message: "You must confirm this work is not under consideration elsewhere",
  }),
  confirmGuidelines: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Author Guidelines",
  }),
  confirmConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to the Privacy Policy",
  }),
});

export const manuscriptStatusUpdateSchema = z.object({
  status: z
    .enum(["submitted", "under_review", "revision_requested", "accepted", "rejected", "published"])
    .optional(),
  paymentStatus: z.enum(["not_required", "pending", "paid", "waived"]).optional(),
  adminNotes: z.string().max(2000).optional(),
});
