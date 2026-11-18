import { z } from "zod";

export const volumeSchema = z.object({
  volumeNumber: z.coerce.number().int().positive("Volume number must be a positive integer"),
  year: z.coerce.number().int().min(1900).max(2100),
  description: z.string().optional(),
});

export const issueSchema = z.object({
  issueNumber: z.coerce.number().int().positive("Issue number must be a positive integer"),
  volume: z.string().min(1, "Volume selection is required"),
  title: z.string().min(2, "Issue title is required").max(200),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  publicationDate: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});
