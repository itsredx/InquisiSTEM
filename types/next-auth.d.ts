// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Extend the built-in session/user/token types
// Add 'id' property to Session's user
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the 'id' property
    } & DefaultSession["user"]; // Keep the default properties
  }

   // Add 'id' property to the User model used within next-auth flows
   interface User extends DefaultUser {
        id: string;
        // Add other custom fields like 'role' if needed
   }
}

// Add 'id' property to the JWT token itself
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string; // Make optional as it might not always be there initially
     // Add other custom fields like 'role' if needed
  }
}