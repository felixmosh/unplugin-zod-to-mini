import { z } from 'zod';

export const EmailSchema = z.email().min(5).max(50).trim();

export const UserSchema = z.object({
  name: z.string().min(2).max(50),
  email: EmailSchema,
  age: z.number().min(0).max(150).optional(),
  role: z.enum(["admin", "user", "guest"]).default("guest"),
});

export const AdminSchema = UserSchema.extend({
  role: z.literal("admin"),
}).strip();

export const PostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  author: UserSchema.omit({ role: true }),
  views: z.number().int().positive().default(0),
  createdAt: z.iso.date().default(new Date().toISOString().split("T")[0]),
});
