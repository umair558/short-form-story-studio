import { z } from "zod";
export const DAILY_THUMBNAIL_LIMIT = 5;
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[0-9]/, "Include a number.");
export const registrationSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(100),
    email: z.string().trim().email(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });
export function utcDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}
