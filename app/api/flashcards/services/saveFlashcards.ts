import { prisma } from "@/lib/db";

export async function saveFlashcardSet(
  userId: string,
  data: {
    title: string;
    subject: string;
    description?: string;
    cards: { front: string; back: string }[];
  }
) {

  const set = await prisma.flashcardSet.create({
    data: {
      title: data.title,
      subject: data.subject,
      description: data.description,
      userId,
      cards: {
        create: data.cards.map((card, index) => ({
          front: card.front,
          back: card.back,
          order: index
        }))
      }
    },
    include: { cards: true }
  });

  return set;
}
