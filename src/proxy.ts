import { auth } from "@/lib/auth/server";

/** Next.js 16 proxy — redirects guests to /login for matched routes. */
export default auth.middleware({
  loginUrl: "/login",
});

export const config = {
  matcher: [
    /*
     * Protect shop + admin app.
     * Leave auth pages, privacy, Neon Auth API, and static assets public.
     */
    "/((?!login|register|privacy|verify|api/auth|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
