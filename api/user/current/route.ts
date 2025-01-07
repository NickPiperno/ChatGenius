import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the Clerk user
    const user = await currentUser();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get custom username from our database
    const dbUser = await db.getUser(userId);
    
    return NextResponse.json({
      id: user.id,
      username: dbUser?.username || user.username || null,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    console.error('[CURRENT_USER_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 