import { z } from "zod";

export const editProfileSchema = z.object({
  username: z.string().optional(),
  bio: z.string().optional(),
  coins: z.number().optional(),
  avatarUrl: z.string().optional(),  
  oldPassword: z.string().optional(),
  newPassword: z.string().optional(),
});