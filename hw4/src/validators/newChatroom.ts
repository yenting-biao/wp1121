import { z } from "zod";

export const newChatroomSchema = z.object({
  user1name: z.string(),
  user2name: z.string(),
});
