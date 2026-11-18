import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(300),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(200),
  authors: z
    .array(
      z.object({
        name: z.string().min(1, "Author name is required"),
        affiliation: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
      })
    )
    .min(1, "At least one author is required"),
  abstract: z.string().min(30, "Abstract must be at least 30 characters"),
  keywords: z.union([z.string(), z.array(z.string())]),
  category: z.string().min(1, "Category is required"),
  volume: z.string().min(1, "Volume is required"),
  issue: z.string().min(1, "Issue is required"),
  publicationDate: z.string().optional(),
  doi: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  sourceManuscript: z.string().optional().or(z.literal("")),
});
