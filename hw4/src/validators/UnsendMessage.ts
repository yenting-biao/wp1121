import { z } from "zod";

export const unsendMessageSchema = z.object({
  id: z.string().or(z.number()),
  chatroomId: z.string(),
  sender: z.string(),
  validity: z.string(),
});
