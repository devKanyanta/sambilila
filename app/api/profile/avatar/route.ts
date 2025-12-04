import { NextRequest, NextResponse } from 'next/server'
import {prisma} from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import sharp from 'sharp'
import crypto from 'crypto'
import { getUserIdFromToken } from '@/lib/auth'

// POST - Upload profile image
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
            
                if (!userId) {
                  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
                }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, uniqueFileName)
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Process image with sharp (resize and optimize)
    const processedImage = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Save processed image
    await writeFile(filePath, processedImage)

    // Create web path for database
    const webPath = `/uploads/avatars/${uniqueFileName}`

    // Update user record with new avatar path
    const updatedUser = await prisma.user.update({
      where: { id: userId},
      data: { avatar: webPath },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true
      }
    })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatar: webPath,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove profile image
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
        
            if (!userId) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }

    // Update user record to remove avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        userType: true
      }
    })

    return NextResponse.json({
      message: 'Avatar removed successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error removing avatar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Dummy function for image upload (for testing without actual file system)
export async function dummyUpload(file: File) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Generate dummy avatar URL using DiceBear API
  const seed = crypto.randomBytes(8).toString('hex')
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  
  return {
    success: true,
    avatarUrl,
    message: 'Avatar uploaded successfully (dummy)'
  }
}