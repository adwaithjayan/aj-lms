import { z } from "zod";

export const courseCategories = [
  "Development",
  "Busincess",
  "Finance",
  "It & productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Health",
  "Music",
  "Teaching",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long"),

  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),

  fileKey: z.string().min(1, "File is required"),

  price: z.coerce.number().min(1, "Price must be a positive number"),

  duration: z.coerce
    .number()
    .min(1, "Duration must be at least 1 hour")
    .max(500, "Duration must be at most 500 hours"),

  level: z
    .enum(["Beginner", "Intermediate", "Advance"])
    .refine((val) => !!val, {
      message: "Level is required",
    }),

  category: z.enum(courseCategories).refine((val) => !!val, {
    message: "category is required",
  }),

  smallDescription: z
    .string()
    .min(3, "Description must be at least 3 characters long")
    .max(200, "Description must be at most 200 characters long"),

  slug: z.string().min(3, "Slug must be at least 3 characters long"),

  status: z.enum(["Draft", "Published", "Archived"]).refine((val) => !!val, {
    message: "Level is required",
  }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;

export const courseLevel = ["Beginner", "Intermediate", "Advance"] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;
