// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // --- Input Validation ---
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    // Add more validation if needed (email format, password complexity)
    if (password.length < 6) {
         return NextResponse.json(
           { message: 'Password must be at least 6 characters long' },
           { status: 400 }
         );
     }


    // --- Check if user already exists ---
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Case-insensitive check
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 } // 409 Conflict
      );
    }

    // --- Hash Password ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Create User ---
    const newUser = await prisma.user.create({
      data: {
        name: name || null, // Use null if name is empty/not provided
        email: email.toLowerCase(),
        password: hashedPassword,
        // emailVerified: null, // Set this later if implementing email verification
      },
    });

    // --- Return Success Response (exclude password) ---
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser; // Exclude password

    return NextResponse.json(
      { user: userWithoutPassword, message: 'User created successfully' },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("Registration API Error:", error);
    // Generic error for security
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  } finally {
      await prisma.$disconnect(); // Disconnect Prisma client
  }
}