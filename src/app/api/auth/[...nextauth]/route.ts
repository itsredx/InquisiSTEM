// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions, User as NextAuthUser, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import bcrypt from 'bcrypt';
// PrismaAdapter might be needed if you switch to database sessions later,
// but it's not strictly required for JWT strategy *if* only used inline.
// import { PrismaAdapter } from "@auth/prisma-adapter";

const prisma = new PrismaClient();

// Define an interface that includes the 'id' property on the user object used within callbacks
// Useful for type safety when modifying the session user object.
interface UserWithId extends NextAuthUser {
  id: string;
}

// Define an interface for the token that includes the 'id'
// Useful for type safety within callbacks.
interface TokenWithId extends JWT {
    id?: string; // ID is added in the jwt callback
}

// --- Authentication Options ---
export const authOptions: AuthOptions = {
    // If using database sessions, uncomment the adapter:
    // adapter: PrismaAdapter(prisma),

    // --- Providers Configuration ---
    providers: [
      CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: "Credentials",
        // `credentials` is used to generate a form on the sign-in page.
        // You can specify which fields should be submitted.
        credentials: {
          email: { label: "Email", type: "email", placeholder: "user@example.com" },
          password: { label: "Password", type: "password" }
        },
        // The authorize callback is where you retrieve the user object based on credentials.
        async authorize(credentials: Record<string, string> | undefined, _req): Promise<PrismaUser | null> {
          // Type credentials as Record<string, string> | undefined for flexibility
          // req is the incoming request object, rename to _req if unused to satisfy ESLint
          console.log(_req);

          const email = credentials?.email;
          const password = credentials?.password;

          if (!email || !password) {
              console.log("[Auth] Authorize: Missing email or password");
              return null; // Indicate failure: missing credentials
          }
          console.log(`[Auth] Authorize: Attempting login for ${email}`);

          try {
              // Find the user in the database by email
              const user = await prisma.user.findUnique({
                 where: { email: email.toLowerCase() } // Ensure consistent casing
              });

              // Check if user exists and has a password stored (essential for credentials auth)
              if (user && user.password) {
                // Compare the provided password with the hashed password in the database
                const isValidPassword = await bcrypt.compare(password, user.password);

                if (isValidPassword) {
                  console.log(`[Auth] Authorize: Login successful for ${email} (ID: ${user.id})`);
                  // IMPORTANT: Return the full user object from the database
                  // It MUST include the 'id'. Sensitive fields like password
                  // won't be exposed to the client via the session object by default.
                  return user;
                } else {
                   console.log(`[Auth] Authorize: Invalid password for ${email}`);
                   return null; // Indicate failure: invalid password
                }
              } else {
                  console.log(`[Auth] Authorize: User not found or no password set for ${email}`);
                  return null; // Indicate failure: user not found or cannot use credentials
              }
          } catch (error) {
              console.error(`[Auth] Authorize error for ${email}:`, error);
              return null; // Indicate failure: internal error
          }
        }
      })
      // You can add other providers here (Google, GitHub, etc.)
      // e.g., GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })
    ],

    // --- Session Configuration ---
    session: {
      // Use JSON Web Tokens (JWT) for session management.
      // Database strategy is an alternative if you uncomment the adapter above.
      strategy: "jwt",

      // Seconds - How long until an idle session expires and is no longer valid.
      // maxAge: 30 * 24 * 60 * 60, // 30 days

      // Seconds - How often to write to the database to extend the session.
      // updateAge: 24 * 60 * 60, // 24 hours
    },

    // --- Custom Pages ---
    pages: {
      signIn: '/login',     // Redirect users to /login if sign-in is required
      newUser: '/register', // Redirect new users (e.g., from OAuth) to /register (optional)
      // error: '/auth/error', // Error page (e.g., for auth errors)
      // signOut: '/auth/signout', // Page after sign out
      // verifyRequest: '/auth/verify-request', // Used for email verification flows
    },

    // --- Callbacks ---
    // Callbacks are asynchronous functions you can use to control what happens
    // when an action is performed (like sign in, session check, JWT creation).
    callbacks: {
      // This callback is called whenever a JWT is created (i.e., on sign-in)
      // or updated (when session is accessed in the browser).
      async jwt({ token, user }: { token: TokenWithId, user?: PrismaUser | AdapterUser | NextAuthUser }): Promise<TokenWithId> {
        // `user` parameter is only passed on initial sign-in.
        // It contains the user object returned by the `authorize` callback or the provider's profile.
        if (user) {
            // Persist the user ID from the user object into the token.
            token.id = user.id;
            // You can add other custom properties to the token here if needed
            // For example: token.role = user.role;
            console.log(`[Auth] JWT Callback: User ID ${user.id} added to token.`);
        }
        return token; // Return the token (potentially with the added id)
      },

      // This callback is called whenever a session is checked (e.g., via `useSession`, `getServerSession`).
      async session({ session, token }: { session: Session, token: TokenWithId }): Promise<Session> {
        // `token` parameter contains the data from the `jwt` callback (including the user id we added).
        // `session` parameter is the default session object.
        if (token && session.user) {
          // Add the user ID from the token to the `session.user` object.
          // This makes `session.user.id` available on the client-side.
          (session.user as UserWithId).id = token.id as string; // Cast needed for type safety
          // Add other properties from token if needed: session.user.role = token.role;
          console.log(`[Auth] Session Callback: User ID ${token.id} added to session.`);
        }
        return session; // Return the session object (potentially modified)
      }
    },

    // --- Events ---
    // Optional: Use for logging or side effects on specific auth events
    // events: {
    //   async signIn(message) { /* on successful sign in */ },
    //   async signOut(message) { /* on sign out */ },
    //   async createUser(message) { /* user created */ },
    //   async updateUser(message) { /* user updated - e.g. their email was verified */ },
    //   async linkAccount(message) { /* account (e.g. provider) linked to user */ },
    //   async session(message) { /* session is active */ },
    // },

    // --- Debugging ---
    // Enable debug messages in the console (useful during development)
    // debug: process.env.NODE_ENV === 'development',

    // --- Secrets ---
    // Use the NEXTAUTH_SECRET environment variable
    secret: process.env.NEXTAUTH_SECRET,
};

// --- Initialize NextAuth.js ---
const handler = NextAuth(authOptions);

// --- Export handlers for GET and POST requests ---
export { handler as GET, handler as POST };