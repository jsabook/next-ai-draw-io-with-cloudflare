import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth"
import {
    getAllStylePresets,
    upsertStylePreset,
    createStylePreset,
    deleteStylePreset,
    isBuiltinPreset,
} from "@/lib/db/style-presets"

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
        const presets = await getAllStylePresets()
        return NextResponse.json({ presets })
    } catch (error) {
        console.error("Get style presets error:", error)
        return NextResponse.json({ error: "获取风格预设失败" }, { status: 500 })
    }
}

// POST — 新增自定义预设
export async function POST(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) {
        return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    try {
        const body = (await request.json()) as {
            label?: string
            description?: string
            prompt_snippet?: string
        }
        const { label, description, prompt_snippet } = body

        if (!label?.trim() || !description?.trim() || !prompt_snippet?.trim()) {
            return NextResponse.json({ error: "label、description、prompt_snippet 不能为空" }, { status: 400 })
        }

        const preset = await createStylePreset({ label: label.trim(), description: description.trim(), prompt_snippet: prompt_snippet.trim() })
        return NextResponse.json({ preset })
    } catch (error) {
        console.error("Create style preset error:", error)
        return NextResponse.json({ error: "新增预设失败" }, { status: 500 })
    }
}

// PUT — 更新预设（内置/自定义均可）
export async function PUT(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) {
        return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    try {
        const body = (await request.json()) as {
            id?: string
            label?: string
            description?: string
            prompt_snippet?: string
            sort_order?: number
        }
        const { id, label, description, prompt_snippet, sort_order } = body

        if (!id || !label?.trim() || !description?.trim() || !prompt_snippet?.trim()) {
            return NextResponse.json({ error: "id、label、description、prompt_snippet 不能为空" }, { status: 400 })
        }

        await upsertStylePreset({
            id,
            label: label.trim(),
            description: description.trim(),
            prompt_snippet: prompt_snippet.trim(),
            sort_order: sort_order ?? 0,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update style preset error:", error)
        return NextResponse.json({ error: "更新预设失败" }, { status: 500 })
    }
}

// DELETE — 删除预设（内置预设不可删除）
export async function DELETE(request: Request) {
    const user = await getAuthenticatedUser()
    if (!user) {
        return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    try {
        const body = (await request.json()) as { id?: string }
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: "id 不能为空" }, { status: 400 })
        }

        if (isBuiltinPreset(id)) {
            return NextResponse.json({ error: "内置预设不可删除" }, { status: 400 })
        }

        await deleteStylePreset(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete style preset error:", error)
        return NextResponse.json({ error: "删除预设失败" }, { status: 500 })
    }
}
