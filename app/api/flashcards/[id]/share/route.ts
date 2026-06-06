// app/api/flashcards/[id]/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const flashcardSet = await prisma.flashcardSet.findUnique({
      where: { id },
      select: { userId: true, shareToken: true },
    });

    if (!flashcardSet) {
      return NextResponse.json(
        { error: "Flashcard set not found" },
        { status: 404 }
      );
    }

    if (flashcardSet.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If already has a share token, return it
    if (flashcardSet.shareToken) {
      return NextResponse.json({
        shareToken: flashcardSet.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/flashcards/${flashcardSet.shareToken}`,
      });
    }

    // Generate a new share token
    const shareToken = crypto.randomUUID();
    await prisma.flashcardSet.update({
      where: { id },
      data: { shareToken, isPublic: true },
    });

    return NextResponse.json({
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/flashcards/${shareToken}`,
    });
  } catch (error) {
    console.error("Error sharing flashcard set:", error);
    return NextResponse.json(
      { error: "Failed to share flashcard set" },
      { status: 500 }
    );
  }
}
