import { z } from "zod";

export const pinMessageSchema = z.object({
  chatroomId: z.string(),
  pinnedMessageId: z.string().or(z.number()),
});
