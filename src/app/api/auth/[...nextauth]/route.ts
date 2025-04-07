// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, User as NextAuthUser } from "next-auth"; // Import User type
import { JWT } from "next-auth/jwt"; // Import JWT type
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, User as PrismaUser } from "@prisma/client"; // Import Prisma User type
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Define an interface that includes the 'id' property on the user object used within callbacks
interface UserWithId extends NextAuthUser {
  id: string;
}
// Define an interface for the token that includes the 'id' (and potentially other custom fields)
interface TokenWithId extends JWT {
    id?: string; // Use optional '?' as it might not be present initially
    // Add other custom fields you might want in the token, like roles
}


export const authOptions: AuthOptions = {
    // ... adapter ...
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "user@example.com" },
          password: { label: "Password", type: "password" }
        },
        // --- Explicitly type the 'credentials' parameter ---
        async authorize(credentials: Record<string, string> | undefined, req): Promise<PrismaUser | null> {
          // Add type: Record<string, string> | undefined
          // Or use the imported 'CredentialInput' or your custom 'MyCredentials' if preferred
  
          // --- Use optional chaining (?) for safer access ---
          const email = credentials?.email;
          const password = credentials?.password;
  
          if (!email || !password) {
              console.log("Authorize: Missing email or password");
              return null;
          }
          console.log(`Authorize: Attempting login for ${email}`);
  
          try { // Add try...catch within authorize for robustness
              const user = await prisma.user.findUnique({ where: { email: email } });
  
              if (user && user.password) {
                const isValidPassword = await bcrypt.compare(password, user.password); // Use variables defined above
                if (isValidPassword) {
                  console.log(`Authorize: Login successful for ${email}`);
                  // Return the full Prisma User object
                  return user;
                } else {
                   console.log(`Authorize: Invalid password for ${email}`);
                }
              } else {
                  console.log(`Authorize: User not found or no password set for ${email}`);
              }
              return null; // Login failed
          } catch (error) {
              console.error(`Authorize error for ${email}:`, error);
              return null; // Return null on error
          }
        }
      })
    ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    newUser: '/register'
  },

  // --- Add Callbacks ---
  callbacks: {
    // 1. JWT Callback: Called when a token is created or updated
    async jwt({ token, user, account, profile, isNewUser }): Promise<TokenWithId> {
        // On initial sign in, the 'user' object passed is the one returned from 'authorize'
      if (user) {
          // Add the user ID to the token
          token.id = user.id;
          // You could add other properties like roles here too
          // token.role = user.role; // Assuming you have a role field
      }
      return token as TokenWithId; // Cast to ensure type safety
    },

    // 2. Session Callback: Called when a session is checked
    async session({ session, token, user }): Promise<any> { // Return type can be Session or any if modifying structure
      // The 'token' parameter here is the JWT object from the 'jwt' callback
      if (token && session.user) {
        // Add the user ID from the token to the session.user object
        (session.user as UserWithId).id = token.id as string; // Cast token.id to string
        // You could add other properties from the token here too
        // session.user.role = token.role;
      }
       // Make sure to return the session object
      return session;
    }
  }
  // --- End Callbacks ---
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };