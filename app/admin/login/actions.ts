"use server"

import { cookies } from "next/headers"
import {
    AUTH_COOKIE_NAME,
    createToken,
    getAuthCookieOptions,
    verifyPassword,
} from "@/lib/auth"
import {
    createAdmin,
    getAdminByUsername,
    getAdminCount,
    updateLastLogin,
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

export interface LoginState {
    error?: string
    success?: boolean
}

export async function loginAction(
    _prevState: LoginState | null,
    formData: FormData,
): Promise<LoginState> {
    const username = formData.get("username")?.toString().trim()
    const password = formData.get("password")?.toString().trim()

    if (!username || !password) {
        return { error: "用户名和密码不能为空" }
    }

    let user = await authenticateWithEnv(username, password)

    if (!user) {
        user = await authenticateWithD1(username, password)
    }

    if (!user) {
        return { error: "用户名或密码错误" }
    }

    const token = await createToken({
        userId: user.id,
        username: user.username,
    })

    const isProduction = process.env.NODE_ENV === "production"
    const cookieOptions = getAuthCookieOptions(isProduction)

    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions)

    return { success: true }
}
