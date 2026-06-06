// app/api/quizzes/[id]/share/route.ts
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

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { userId: true, shareToken: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If already has a share token, return it
    if (quiz.shareToken) {
      return NextResponse.json({
        shareToken: quiz.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/quiz/${quiz.shareToken}`,
      });
    }

    // Generate a new share token
    const shareToken = crypto.randomUUID();
    await prisma.quiz.update({
      where: { id },
      data: { shareToken, isPublic: true },
    });

    return NextResponse.json({
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/quiz/${shareToken}`,
    });
  } catch (error) {
    console.error("Error sharing quiz:", error);
    return NextResponse.json(
      { error: "Failed to share quiz" },
      { status: 500 }
    );
  }
}
