import { z } from "zod";

export const deleteChatroomSchema = z.object({
  chatroomId: z.string(),
});
