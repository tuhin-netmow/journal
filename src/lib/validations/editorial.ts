import { z } from "zod";

export const editorialBoardSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  academicTitle: z.string().max(50).optional(),
  role: z.string().min(2, "Role is required").max(100),
  institution: z.string().min(2, "Institution is required").max(150),
  country: z.string().max(80).optional(),
  specialization: z.string().max(200).optional(),
  photo: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
});
