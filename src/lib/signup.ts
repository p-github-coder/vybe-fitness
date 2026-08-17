import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const baseSignupSchema = z.object({
  first_name: z.string().trim().min(2, "Enter your first name").max(50),
  last_name: z.string().trim().min(2, "Enter your last name").max(50),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "Letters, numbers, dots and underscores only"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number"),
  age: z.coerce.number().int().min(16, "You must be at least 16").max(100, "Enter a valid age"),
  password: passwordSchema,
  confirm_password: z.string(),
});

export const memberSignupSchema = baseSignupSchema
  .extend({ gender: z.string().trim().max(30).optional() })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const trainerSignupSchema = baseSignupSchema
  .extend({
    years_of_experience: z.coerce.number().int().min(0).max(60),
    certifications: z.string().trim().min(2, "List at least one certification").max(300),
    specialties: z.string().trim().min(2, "List at least one specialty").max(300),
    areas_of_expertise: z.string().trim().min(2, "List at least one area of expertise").max(300),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export function collectErrors(error: z.ZodError): Record<string, string> {
  const next: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = String(issue.path[0]);
    if (!next[key]) next[key] = issue.message;
  });
  return next;
}

/** Maps backend failures to friendly copy — raw database errors are never surfaced. */
export function friendlySignupError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (lower.includes("profiles_username_key") || lower.includes("username")) {
    return "That username is already taken. Please choose another.";
  }
  if (lower.includes("password")) {
    return "That password was rejected. Choose a stronger, unique password.";
  }
  if (lower.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return "We couldn't create your account right now. Please try again.";
}

export async function isUsernameTaken(username: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  return !!data;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Upload a JPG, PNG or WEBP image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be smaller than 5MB.";
  return null;
}

export async function uploadTrainerImage(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/profile.${ext}`;
  const { error } = await supabase.storage
    .from("trainer-images")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  const { data } = await supabase.storage.from("trainer-images").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? null;
}
