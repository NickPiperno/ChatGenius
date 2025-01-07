import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get username from our database
    const user = await db.getUser(userId);
    
    return NextResponse.json({
      username: user?.username || null
    });
  } catch (error) {
    console.error('[USERNAME_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 