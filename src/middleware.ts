import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/pricing",
    "/login/linkedin",
    "/api/auth/linkedin/callback",
    "/dashboard/linkedin",
    "/api/auth/linkedin/exchange-code",
    "/test-env"
  ],
  // Routes that can be accessed while signed in or signed out
  ignoredRoutes: [
    "/api/webhooks/clerk",
  ],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
    // Redirect signed in users trying to access auth pages back to dashboard
    if (auth.userId && (req.url.includes('/sign-in') || req.url.includes('/sign-up'))) {
      const dashboard = new URL('/dashboard', req.url);
      return Response.redirect(dashboard);
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 