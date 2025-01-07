import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { PrismaClient } from '@prisma/client'
import { updateUsername } from '@/lib/db/mongodb'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { username } = await request.json()
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    // Check if username is already taken in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser && existingUser.clerkId !== userId) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Update or create user in Prisma
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { username },
      create: {
        clerkId: userId,
        username
      }
    })

    // Update username in MongoDB messages
    await updateUsername(userId, username)

    // Broadcast username update to all connected clients
    if (global.io) {
      global.io.emit('username_updated', {
        userId,
        username
      })
    }

    return NextResponse.json({ 
      success: true,
      username: user.username,
      message: 'Username updated successfully'
    })
  } catch (error) {
    console.error('Error updating username:', error)
    return NextResponse.json(
      { error: 'Error updating username' },
      { status: 500 }
    )
  }
} 