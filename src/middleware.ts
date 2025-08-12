import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/protected(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/health-ai",
  "/general-inquiry", 
  "/report-analyzer",
  "/find-doctor",
  "/drug-dictionary",
  "/dictionary",
  "/about",
  "/settings",
  "/api/webhook(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    try {
      const session = await auth();
      if (!session.userId) {
        // Redirect to sign-in if not authenticated
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
    } catch (error) {
      // Redirect to sign-in if authentication fails
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
