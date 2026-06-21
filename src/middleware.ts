import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const authPages =
    path.startsWith("/login") ||
    path.startsWith("/register");

  const protectedPages =
    path.startsWith("/chat");

  if (!user && protectedPages) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (user && authPages) {
    return NextResponse.redirect(
      new URL("/chat", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/login",
    "/register",
  ],
};