import { z } from "zod"

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")

export const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: PasswordSchema,
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  createdAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

export const ShortlinkSchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string().url(),
  visits: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Shortlink = z.infer<typeof ShortlinkSchema>

export const CreateShortlinkSchema = z.object({
  slug: z.string().min(1),
  url: z.string().url(),
})

export type CreateShortlink = z.infer<typeof CreateShortlinkSchema>

export const UpdateShortlinkSchema = z.object({
  slug: z.string().min(1).optional(),
  url: z.string().url().optional(),
})

export type UpdateShortlink = z.infer<typeof UpdateShortlinkSchema>

export const ShortlinkQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().optional(),
  sortBy: z.enum(["createdAt", "visits"]).default("createdAt"),
})

export type ShortlinkQuery = z.infer<typeof ShortlinkQuerySchema>

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: PasswordSchema.optional(),
})

export type UpdateUser = z.infer<typeof UpdateUserSchema>
