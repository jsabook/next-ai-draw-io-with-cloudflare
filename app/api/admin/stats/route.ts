import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyToken } from "@/lib/auth"
import { db } from "@/lib/db/client"

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
        // 总调用次数
        const totalRow = await db.first<{ total: number }>(
            "SELECT COUNT(*) as total FROM request_logs",
        )

        // 今日调用次数
        const todayRow = await db.first<{ total: number }>(
            "SELECT COUNT(*) as total FROM request_logs WHERE date(timestamp) = date('now')",
        )

        // 本周调用次数
        const weekRow = await db.first<{ total: number }>(
            "SELECT COUNT(*) as total FROM request_logs WHERE timestamp >= datetime('now', '-7 days')",
        )

        // 成功率
        const successRow = await db.first<{
            success_count: number
            total: number
        }>(
            "SELECT SUM(success) as success_count, COUNT(*) as total FROM request_logs",
        )

        // 平均耗时
        const durationRow = await db.first<{ avg_duration: number }>(
            "SELECT AVG(duration_ms) as avg_duration FROM request_logs WHERE success = 1 AND duration_ms IS NOT NULL",
        )

        // token 总量
        const tokenRow = await db.first<{
            total_input: number
            total_output: number
        }>(
            "SELECT SUM(input_tokens) as total_input, SUM(output_tokens) as total_output FROM request_logs",
        )

        // 模型使用分布（top 5）
        const modelRows = await db.all<{ model: string; count: number }>(
            "SELECT model, COUNT(*) as count FROM request_logs WHERE model IS NOT NULL GROUP BY model ORDER BY count DESC LIMIT 5",
        )

        // 错误类型分布
        const errorRows = await db.all<{ error_type: string; count: number }>(
            "SELECT error_type, COUNT(*) as count FROM request_logs WHERE success = 0 AND error_type IS NOT NULL GROUP BY error_type ORDER BY count DESC LIMIT 5",
        )

        // 近 7 天每日调用量
        const dailyRows = await db.all<{
            date: string
            count: number
            success_count: number
        }>(
            `SELECT
                date(timestamp) as date,
                COUNT(*) as count,
                SUM(success) as success_count
             FROM request_logs
             WHERE timestamp >= datetime('now', '-7 days')
             GROUP BY date(timestamp)
             ORDER BY date ASC`,
        )

        return NextResponse.json({
            overview: {
                total: totalRow?.total ?? 0,
                today: todayRow?.total ?? 0,
                week: weekRow?.total ?? 0,
                successRate: successRow?.total
                    ? Math.round(
                          ((successRow.success_count ?? 0) / successRow.total) *
                              100,
                      )
                    : 100,
                avgDuration: Math.round(durationRow?.avg_duration ?? 0),
                totalInputTokens: tokenRow?.total_input ?? 0,
                totalOutputTokens: tokenRow?.total_output ?? 0,
            },
            modelDistribution: modelRows,
            errorDistribution: errorRows,
            dailyStats: dailyRows,
        })
    } catch (error) {
        console.error("Stats error:", error)
        return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 })
    }
}
