// app/api/public/flashcards/[shareToken]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: { shareToken },
      include: {
        cards: {
          orderBy: { order: "asc" },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!flashcardSet || !flashcardSet.isPublic) {
      return NextResponse.json(
        { error: "Flashcard set not found or not shared" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      flashcardSet: {
        id: flashcardSet.id,
        title: flashcardSet.title,
        subject: flashcardSet.subject,
        description: flashcardSet.description,
        cards: flashcardSet.cards.map((card) => ({
          id: card.id,
          front: card.front,
          back: card.back,
          order: card.order,
        })),
        createdByName: flashcardSet.user.name,
        createdAt: flashcardSet.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching shared flashcard set:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcard set" },
      { status: 500 }
    );
  }
}
