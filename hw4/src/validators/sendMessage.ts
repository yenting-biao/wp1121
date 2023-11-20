import { z } from "zod";

export const sendMessageSchema = z.object({
  chatroomId: z.string(),
  sender: z.string(),
  message: z.string(),
});
