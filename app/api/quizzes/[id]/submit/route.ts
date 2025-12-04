// app/api/quizzes/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/auth";

interface Answer {
  questionId: string;
  answer: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ make params async
) {
  try {
    const userId = await getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ unwrap params
    const { id } = await params;

    const body = await request.json();
    const { answers } = body as { answers: Answer[] };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Answers array is required" },
        { status: 400 }
      );
    }

    // Fetch the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Calculate score
    let correctCount = 0;
    const detailedResults = answers.map(({ questionId, answer }) => {
      const question = quiz.questions.find((q) => q.id === questionId);

      if (!question) {
        return {
          questionId,
          userAnswer: answer,
          correct: false,
          correctAnswer: null,
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

    // Save the result
    const quizResult = await prisma.quizResult.create({
      data: {
        userId,
        quizId: quiz.id,
        score,
        totalQuestions,
        answers: detailedResults,
      },
    });

    // Create a study session record
    await prisma.studySession.create({
      data: {
        userId,
        sessionType: "QUIZ",
        duration: 0,
        cardsStudied: totalQuestions,
        correctAnswers: correctCount,
      },
    });

    return NextResponse.json({
      result: {
        id: quizResult.id,
        score: Math.round(score * 100) / 100,
        correctCount,
        totalQuestions,
        percentage: `${Math.round(score)}%`,
        passed: score >= 70,
      },
      detailedResults,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);

    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
