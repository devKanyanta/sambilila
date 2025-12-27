import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

/* ---------------- R2 Client Initialization ---------------- */

if (
  !process.env.R2_BUCKET_NAME ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_ENDPOINT_URL
) {
  throw new Error("Missing R2 credentials in environment variables.");
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

/* ================================================================
                              POST (Generate Signed URL)
   ================================================================ */

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const clientFileName = formData.get("fileName") as string | null;
    const contentType = formData.get("contentType") as string | null;
    const numberOfQuestions = parseInt(formData.get('numberOfQuestions') as string) || 10;
    const difficulty = formData.get('difficulty') as string || 'medium';
    const questionTypes = formData.get('questionTypes') as string || 'MULTIPLE_CHOICE,TRUE_FALSE';

    const commonData = {
      userId,
      title: (formData.get("title") as string) || "AI Generated Quiz",
      status: "PENDING" as const,
    };

    if (!clientFileName && (!text || !text.trim())) {
      return NextResponse.json(
        { error: "File name or text content is required" },
        { status: 400 }
      );
    }

    // --- Case 1: Text Only ---
    if (!clientFileName) {
      const job = await prisma.quizJob.create({
        data: {
          ...commonData,
          text: text?.trim(),
          numberOfQuestions: numberOfQuestions.toString(),
          difficulty: difficulty,
          questionTypes: questionTypes
        },
      });

      return NextResponse.json({
        success: true,
        jobId: job.id,
        message: "Quiz generation job created (text only)."
      });
    }

    // --- Case 2: File Upload ---
    const fileKey = `${uuidv4()}.pdf`; 
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType || 'application/pdf',
    });

    const signedUrl = await getSignedUrl(r2Client, putCommand, { expiresIn: 3600 });

    const job = await prisma.quizJob.create({
      data: {
        ...commonData,
        fileUrl: `r2://${R2_BUCKET_NAME}/${fileKey}`,
        text: text?.trim() || undefined,
        numberOfQuestions: numberOfQuestions.toString(),
        difficulty: difficulty,
        questionTypes: questionTypes
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      signedUrl: signedUrl,
      fileKey: fileKey,
      message: "Quiz generation job created. Please upload the file.",
      uploadMethod: "PUT",
      requiredHeaders: { "Content-Type": contentType || "application/pdf" },
    });
  } catch (err: any) {
    console.error("❌ Quiz Job POST error:", err);
    return NextResponse.json({ error: "Job creation failed" }, { status: 503 });
  }
}

/* ================================================================
                              GET (Check Job Status)
   ================================================================ */

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "Job ID is required" }, { status: 400 });

    const job = await prisma.quizJob.findFirst({
      where: { id: jobId, userId },
      include: {
        quiz: {
          include: { 
            questions: { orderBy: { order: "asc" } } 
          },
        },
      },
    });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({
      job: {
        id: job.id,
        status: job.status,
        error: job.error,
        numberOfQuestions: job.numberOfQuestions.toString(),
        difficulty: job.difficulty,
        questionTypes: job.questionTypes,
        createdAt: job.createdAt.toISOString(),
      },
      quiz: job.quiz ? {
        id: job.quiz.id,
        title: job.quiz.title,
        subject: job.quiz.subject,
        questions: job.quiz.questions,
      } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

/* ================================================================
                              DELETE (Cancel Job)
   ================================================================ */

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    const job = await prisma.quizJob.findFirst({
      where: { id: jobId, userId, status: { in: ["PENDING", "PROCESSING"] } },
    });

    if (!job) return NextResponse.json({ error: "Job cannot be cancelled" }, { status: 404 });

    await prisma.quizJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: "Cancelled by user" },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 });
  }
}