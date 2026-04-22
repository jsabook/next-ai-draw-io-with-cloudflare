import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
    verifyPassword,
    createToken,
    AUTH_COOKIE_NAME,
    getAuthCookieOptions,
} from "@/lib/auth"
import {
    getAdminByUsername,
    updateLastLogin,
    createAdmin,
    getAdminCount,
} from "@/lib/db/admin-users"

async function authenticateWithEnv(username: string, password: string) {
    const envUsername = process.env.ADMIN_USERNAME
    const envPasswordHash = process.env.ADMIN_PASSWORD_HASH

    if (!envUsername || !envPasswordHash) return null
    if (username !== envUsername) return null

    const isValid = await verifyPassword(password, envPasswordHash)
    if (!isValid) return null

    return { id: 1, username: envUsername }
}

async function authenticateWithD1(username: string, password: string) {
    try {
        const adminCount = await getAdminCount()
        if (adminCount === 0) {
            await createAdmin(username, password)
        }

        const admin = await getAdminByUsername(username)
        if (!admin) return null

        const isValid = await verifyPassword(password, admin.password_hash)
        if (!isValid) return null

        await updateLastLogin(admin.id)

        return { id: admin.id, username: admin.username }
    } catch {
        return null
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            username?: string
            password?: string
        }
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json(
                { error: "用户名和密码不能为空" },
                { status: 400 }
            )
        }

        let user = await authenticateWithEnv(username, password)

        if (!user) {
            user = await authenticateWithD1(username, password)
        }

        if (!user) {
            return NextResponse.json(
                { error: "用户名或密码错误" },
                { status: 401 }
            )
        }

        const token = await createToken({
            userId: user.id,
            username: user.username,
        })

        const isProduction = process.env.NODE_ENV === "production"
        const cookieOptions = getAuthCookieOptions(isProduction)

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username },
        })
        response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions)
        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "登录失败" }, { status: 500 })
    }
}
