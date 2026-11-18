import { z } from "zod";

export const pageContentSchema = z.object({
  pageKey: z.string().min(2, "Page key is required"),
  title: z.string().optional(),
  content: z.string().min(1, "Content cannot be empty"),
});
