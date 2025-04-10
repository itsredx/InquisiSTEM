// src/app/api/lessons/progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // Use next-auth/next for server context
import { authOptions } from '@/lib/auth'; // Import from the new location (adjust path if needed)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- GET Handler: Fetch completed lessons for the logged-in user ---
export async function GET(_req: Request) {
  const session = await getServerSession(authOptions); // Get session server-side

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log(_req);
  try {
    const completed = await prisma.completedLesson.findMany({
      where: { userId: userId },
      select: { lessonTitle: true }, // Only select the titles
    });

    const titles = completed.map(item => item.lessonTitle); // Extract titles into an array
    return NextResponse.json({ completedLessonTitles: titles });

  } catch (error) {
    console.error("API GET Progress Error:", error);
    return NextResponse.json({ message: 'Failed to fetch progress' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// --- POST Handler: Mark a lesson as completed for the logged-in user ---
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { lessonTitle } = body;

    if (!lessonTitle || typeof lessonTitle !== 'string') {
      return NextResponse.json({ message: 'Lesson title is required' }, { status: 400 });
    }

    // Use create to add the record. The @@unique constraint handles duplicates.
    await prisma.completedLesson.create({
      data: {
        userId: userId,
        lessonTitle: lessonTitle,
      },
    });

    return NextResponse.json({ message: 'Progress saved successfully' }, { status: 201 });

  } catch (error: unknown) {
    // Check if the error is due to the unique constraint violation
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: 'Lesson already marked as complete' }, { status: 200 });
     }
     console.error("API POST Progress Error:", error);
     // Handle other potential error types if necessary
     return NextResponse.json({ message: 'Failed to save progress' }, { status: 500 });
 } finally {
    await prisma.$disconnect();
  }
}