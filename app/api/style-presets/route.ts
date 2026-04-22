import { NextResponse } from "next/server"
import { getAllStylePresets } from "@/lib/db/style-presets"

export const runtime = "edge"

export async function GET() {
    try {
        const presets = await getAllStylePresets()
        return NextResponse.json({ presets })
    } catch (error) {
        console.error("Get style presets error:", error)
        return NextResponse.json({ error: "获取风格预设失败" }, { status: 500 })
    }
}
