import { z } from "zod";

export const FlashcardSchema = z.object({
  title: z.string(),
  subject: z.string(),
  description: z.string().optional(),
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    })
  )
});
