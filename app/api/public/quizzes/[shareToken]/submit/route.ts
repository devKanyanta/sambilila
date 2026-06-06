// app/api/public/quizzes/[shareToken]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Answer {
  questionId: string;
  answer: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const body = await request.json();
    const { answers } = body as { answers: Answer[] };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 }
      );
    }

    // Fetch the quiz with questions (must be public)
    const quiz = await prisma.quiz.findUnique({
      where: { shareToken },
      include: {
        questions: true,
      },
    });

    if (!quiz || !quiz.isPublic) {
      return NextResponse.json(
        { error: "Quiz not found or not shared" },
        { status: 404 }
      );
    }

    // Calculate score in-memory (no DB save)
    let correctCount = 0;
    const detailedResults = answers.map(({ questionId, answer }) => {
      const question = quiz.questions.find((q) => q.id === questionId);

      if (!question) {
        return {
          questionId,
          userAnswer: answer,
          correct: false,
          correctAnswer: null,
          question: null,
          type: null,
        };
      }

      let isCorrect = false;

      switch (question.type) {
        case "MULTIPLE_CHOICE":
        case "TRUE_FALSE":
          isCorrect =
            answer.toLowerCase().trim() ===
            question.correctAnswer.toLowerCase().trim();
          break;

        case "SHORT_ANSWER": {
          const userAns = answer.toLowerCase().trim();
          const correctAns = question.correctAnswer.toLowerCase().trim();
          isCorrect =
            userAns === correctAns ||
            userAns.includes(correctAns) ||
            correctAns.includes(userAns);
          break;
        }
      }

      if (isCorrect) correctCount++;

      return {
        questionId,
        userAnswer: answer,
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        question: question.question,
        type: question.type,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = (correctCount / totalQuestions) * 100;

    return NextResponse.json({
      result: {
        id: null, // No DB record for public users
        score: Math.round(score * 100) / 100,
        correctCount,
        totalQuestions,
        percentage: `${Math.round(score)}%`,
        passed: score >= 70,
      },
      detailedResults,
    });
  } catch (error) {
    console.error("Error submitting shared quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
