import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth"
import {
    PROMPT_DEFINITIONS,
    getAllPromptOverrides,
    upsertPromptOverride,
    deletePromptOverride,
} from "@/lib/db/prompts"

async function getAuthenticatedUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

export async function GET() {
    const user = await getAuthenticatedUser()
    if (!user) {
        return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    try {
        const overrides = await getAllPromptOverrides()

        const prompts = PROMPT_DEFINITIONS.map((def) => ({
            key: def.key,
            label: def.label,
            description: def.description,
            defaultContent: def.defaultContent,
            overrideContent: overrides[def.key] ?? null,
            isOverridden: def.key in overrides,
        }))

        return NextResponse.json({ prompts })
    } catch (error) {
        console.error("Get prompts error:", error)
        return NextResponse.json({ error: "获取提示词失败" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) {
        return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    try {
        const body = (await request.json()) as { key?: string; content?: string }
        const { key, content } = body

        if (!key || content === undefined || content === null) {
            return NextResponse.json({ error: "key 和 content 不能为空" }, { status: 400 })
        }

        const validKeys = PROMPT_DEFINITIONS.map((d) => d.key)
        if (!validKeys.includes(key)) {
            return NextResponse.json({ error: "无效的提示词 key" }, { status: 400 })
        }

        await upsertPromptOverride(key, content)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update prompt error:", error)
        return NextResponse.json({ error: "更新提示词失败" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) {
        return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    try {
        const body = (await request.json()) as { key?: string }
        const { key } = body

        if (!key) {
            return NextResponse.json({ error: "key 不能为空" }, { status: 400 })
        }

        const validKeys = PROMPT_DEFINITIONS.map((d) => d.key)
        if (!validKeys.includes(key)) {
            return NextResponse.json({ error: "无效的提示词 key" }, { status: 400 })
        }

        await deletePromptOverride(key)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete prompt error:", error)
        return NextResponse.json({ error: "重置提示词失败" }, { status: 500 })
    }
}
