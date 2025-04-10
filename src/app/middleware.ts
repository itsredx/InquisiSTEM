// src/middleware.ts
export { default } from "next-auth/middleware"

// Applies next-auth only to matching routes - can be regex
export const config = { matcher: ["/learn/:path*"] } // Protect the learning section