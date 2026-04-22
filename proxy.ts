import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { i18n } from "./lib/i18n/config"
import { verifyToken, AUTH_COOKIE_NAME } from "./lib/auth"

const PUBLIC_ADMIN_PATHS = ["/admin/login"]

function getLocale(request: NextRequest): string | undefined {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
        negotiatorHeaders[key] = value
    })

    // @ts-expect-error locales are readonly
    const locales: string[] = i18n.locales

    // Use negotiator and intl-localematcher to get best locale
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales,
    )

    const locale = matchLocale(languages, locales, i18n.defaultLocale)

    return locale
}

async function handleAdminAuth(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path)) {
        return null
    }

    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const payload = await verifyToken(token)

    if (!payload) {
        const response = NextResponse.redirect(
            new URL("/admin/login", request.url)
        )
        response.cookies.delete(AUTH_COOKIE_NAME)
        return response
    }

    return null
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Handle admin routes authentication
    if (pathname.startsWith("/admin")) {
        const authResponse = await handleAdminAuth(request)
        if (authResponse) {
            return authResponse
        }
        return
    }

    // Skip API routes, static files, and Next.js internals
    if (
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/drawio") ||
        pathname.includes("/favicon") ||
        /\.(.*)$/.test(pathname)
    ) {
        return
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) =>
            !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // Redirect to localized path
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
                request.url,
            ),
        )
    }
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
