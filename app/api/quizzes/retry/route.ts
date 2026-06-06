import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Find the job and verify it belongs to the user
    const job = await prisma.quizJob.findFirst({
      where: { id: jobId, userId, status: "FAILED" },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not in FAILED state" },
        { status: 404 }
      );
    }

    // Reset the job status to PENDING and clear the error
    const updatedJob = await prisma.quizJob.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        error: null,
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        id: updatedJob.id,
        title: updatedJob.title,
        difficulty: updatedJob.difficulty,
        numberOfQuestions: updatedJob.numberOfQuestions,
        questionType: updatedJob.questionTypes,
        status: updatedJob.status,
        error: updatedJob.error,
        createdAt: updatedJob.createdAt.toISOString(),
      },
      message: "Job retried successfully. It will be processed shortly.",
    });
  } catch (err: any) {
    console.error("❌ Retry quiz job error:", err);
    return NextResponse.json({ error: "Failed to retry job" }, { status: 500 });
  }
}
