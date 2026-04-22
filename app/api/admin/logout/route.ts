import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME } from "@/lib/auth"

export async function POST() {
    try {
        const response = NextResponse.json({ success: true })
        response.cookies.delete(AUTH_COOKIE_NAME)
        return response
    } catch (error) {
        console.error("Logout error:", error)
        return NextResponse.json({ error: "登出失败" }, { status: 500 })
    }
}
