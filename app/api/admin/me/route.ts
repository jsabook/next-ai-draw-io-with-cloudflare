import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

        if (!token) {
            return NextResponse.json({ error: "未登录" }, { status: 401 })
        }

        const payload = await verifyToken(token)

        if (!payload) {
            return NextResponse.json(
                { error: "登录已过期" },
                { status: 401 }
            )
        }

        return NextResponse.json({
            user: {
                id: payload.userId,
                username: payload.username,
            },
        })
    } catch (error) {
        console.error("Get user error:", error)
        return NextResponse.json(
            { error: "获取用户信息失败" },
            { status: 500 }
        )
    }
}
