// app/api/public/quizzes/[shareToken]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { shareToken },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!quiz || !quiz.isPublic) {
      return NextResponse.json(
        { error: "Quiz not found or not shared" },
        { status: 404 }
      );
    }

    // Strip correct answers from the response so public users can't cheat
    const questions = quiz.questions.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      order: q.order,
    }));

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        description: quiz.description,
        questions,
        createdByName: quiz.user.name,
        createdAt: quiz.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching shared quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
