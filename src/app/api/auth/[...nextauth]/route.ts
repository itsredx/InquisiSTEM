// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import from the new location (adjust path if needed)

// Initialize NextAuth.js using the imported options
const handler = NextAuth(authOptions);

// Export handlers for GET and POST requests
export { handler as GET, handler as POST };