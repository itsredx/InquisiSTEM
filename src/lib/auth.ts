// src/lib/auth.ts

import { AuthOptions, User as NextAuthUser, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import bcrypt from 'bcrypt';

// PrismaAdapter might be needed if switching session strategy
// import { PrismaAdapter } from "@auth/prisma-adapter";

// Instantiate Prisma Client here or import if instantiated elsewhere globally
const prisma = new PrismaClient();

// Interfaces needed for callbacks
interface UserWithId extends NextAuthUser {
  id: string;
}
interface TokenWithId extends JWT {
    id?: string;
}

// --- Define AND EXPORT Authentication Options ---
export const authOptions: AuthOptions = { // Add 'export' here
    // adapter: PrismaAdapter(prisma), // Keep commented out for JWT strategy

    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "user@example.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials: Record<string, string> | undefined, _req): Promise<PrismaUser | null> {
          const email = credentials?.email;
          const password = credentials?.password;
          console.log(_req);
          if (!email || !password) { return null; }
          try {
              const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
              if (user && user.password) {
                  const isValidPassword = await bcrypt.compare(password, user.password);
                  if (isValidPassword) { return user; }
              } return null;
          } catch (error) { console.error(`[Auth] Authorize error for ${email}:`, error); return null; }
        }
      })
    ],
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: '/login',
      newUser: '/register',
    },
    callbacks: {
      async jwt({ token, user }: { token: TokenWithId, user?: PrismaUser | AdapterUser | NextAuthUser }): Promise<TokenWithId> {
        if (user) { token.id = user.id; }
        return token;
      },
      async session({ session, token }: { session: Session, token: TokenWithId }): Promise<Session> {
        if (token && session.user) { (session.user as UserWithId).id = token.id as string; }
        return session;
      }
    },
    secret: process.env.NEXTAUTH_SECRET,
    // debug: process.env.NODE_ENV === 'development',
};