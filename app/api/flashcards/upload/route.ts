import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromToken } from "@/lib/auth";
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

// Initialize S3Client, pointing it to the R2 endpoint
const r2Client = new S3Client({
  region: "auto", // Required by R2
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  // Optional: Add forcePathStyle if needed
  // forcePathStyle: true,
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
    // These fields are sent by the client to request the signed URL
    const text = formData.get("text") as string | null;
    const clientFileName = formData.get("fileName") as string | null;
    const contentType = formData.get("contentType") as string | null;

    if (!clientFileName && (!text || !text.trim())) {
      return NextResponse.json(
        { error: "File name or text content is required" },
        { status: 400 }
      );
    }

    // Default to handling text content if no file name is provided
    if (!clientFileName) {
      // --- Create Job for Text Only ---
      const job = await prisma.flashcardJob.create({
        data: {
          userId,
          text: text?.trim() || undefined,
          title: (formData.get("title") as string) || "AI Flashcards",
          subject: (formData.get("subject") as string) || "General",
          description: (formData.get("description") as string) || "Generated from text",
          status: "PENDING", // Text-only jobs go straight to PENDING
        },
      });

      return NextResponse.json({
        success: true,
        jobId: job.id,
        job: job,
        message: "Flashcard generation job created successfully (text only)."
      });
    }

    // --- Handle File Upload ---
    const fileKey = `${uuidv4()}.pdf`; // The final path in the R2 bucket
    console.log(`🔑 Generating signed PUT URL for R2 key: ${fileKey}`);

    // Generate a presigned PUT URL for direct client upload
    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType || 'application/pdf',
    });

    const signedUrl = await getSignedUrl(r2Client, putCommand, { 
      expiresIn: 3600 // 1 hour expiry
    });

    console.log(`✅ Signed PUT URL generated: ${signedUrl}`);

    // --- Create PENDING_UPLOAD Job (fileKey will be used by worker AFTER upload) ---
    const job = await prisma.flashcardJob.create({
      data: {
        userId,
        // fileUrl stores the internal R2 path
        fileUrl: `r2://${R2_BUCKET_NAME}/${fileKey}`, 
        text: text?.trim() || undefined,
        title: (formData.get("title") as string) || "AI Flashcards",
        subject: (formData.get("subject") as string) || "General",
        description: (formData.get("description") as string) || "Generated from PDF",
        status: "PENDING_UPLOAD", // CHANGED: Job starts in PENDING_UPLOAD state
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      job: {
        id: job.id,
        title: job.title,
        subject: job.subject,
        description: job.description,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
      },
      // Return the signed PUT URL for direct upload
      signedUrl: signedUrl,
      fileKey: fileKey,
      message: "Flashcard generation job created. Upload file using PUT method.",
      // Optional: Return upload instructions
      uploadMethod: "PUT",
      requiredHeaders: {
        "Content-Type": contentType || "application/pdf",
      },
    });
  } catch (err: any) {
    console.error("❌ R2 Signed URL error:", err);
    return NextResponse.json(
      {
        error: "Upload setup failed. Please check R2 credentials and permissions.",
        details:
          process.env.NODE_ENV === "development"
            ? err.message
            : undefined,
      },
      { status: 503 }
    );
  }
}

/* ================================================================
                              PATCH (Confirm Upload Complete)
   ================================================================ */

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    // Verify the job exists and belongs to the user
    const job = await prisma.flashcardJob.findFirst({
      where: { 
        id: jobId, 
        userId,
        status: "PENDING_UPLOAD" // Only update if still in PENDING_UPLOAD state
      },
    });

    if (!job) {
      return NextResponse.json({ 
        error: "Job not found, already processed, or not in upload state" 
      }, { status: 404 });
    }

    // Update job status to PENDING so the worker can process it
    const updatedJob = await prisma.flashcardJob.update({
      where: { id: jobId },
      data: { 
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Upload confirmed. Job is now in processing queue."
    });
  } catch (err: any) {
    console.error("❌ Confirm upload error:", err);
    return NextResponse.json({ error: "Failed to confirm upload" }, { status: 500 });
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

    const job = await prisma.flashcardJob.findFirst({
      where: { id: jobId, userId },
      include: {
        flashcardSet: {
          include: { cards: { orderBy: { order: "asc" } } },
        },
      },
    });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        subject: job.subject,
        description: job.description,
        status: job.status,
        error: job.error,
        fileUrl: job.fileUrl,
        createdAt: job.createdAt.toISOString(),
      },
      flashcardSet: job.flashcardSet
        ? {
            id: job.flashcardSet.id,
            title: job.flashcardSet.title,
            subject: job.flashcardSet.subject,
            description: job.flashcardSet.description,
            cards: job.flashcardSet.cards,
            createdAt: job.flashcardSet.createdAt.toISOString(),
          }
        : null,
    });
  } catch (err: any) {
    console.error("❌ Get job status error:", err);
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 });
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

    const job = await prisma.flashcardJob.findFirst({
      where: { id: jobId, userId, status: { in: ["PENDING", "PROCESSING"] } },
    });

    if (!job) return NextResponse.json({ error: "Job not found or cannot be cancelled" }, { status: 404 });

    await prisma.flashcardJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: "Cancelled by user" },
    });

    return NextResponse.json({ success: true, message: "Job cancelled successfully" });
  } catch (err: any) {
    console.error("❌ Cancel job error:", err);
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 });
  }
}

/* ================================================================
                    OPTIONS (CORS Preflight)
   ================================================================ */

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}