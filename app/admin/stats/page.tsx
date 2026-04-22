"use client"

import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    Cpu,
    RefreshCw,
    TrendingUp,
    Zap,
} from "lucide-react"
import { useEffect, useState } from "react"

interface StatsData {
    overview: {
        total: number
        today: number
        week: number
        successRate: number
        avgDuration: number
        totalInputTokens: number
        totalOutputTokens: number
    }
    modelDistribution: { model: string; count: number }[]
    errorDistribution: { error_type: string; count: number }[]
    dailyStats: { date: string; count: number; success_count: number }[]
}

function formatNumber(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
    return String(n)
}

function StatCard({
    icon,
    label,
    value,
    sub,
    iconColor,
}: {
    icon: React.ReactNode
    label: string
    value: string
    sub?: string
    iconColor: string
}) {
    return (
        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
            <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 [&>svg]:h-4 [&>svg]:w-4 ${iconColor}`}
            >
                {icon}
            </div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#475569] mb-1">
                {label}
            </p>
            <p className="text-[1.4rem] font-bold text-[#f1f5f9]">{value}</p>
            {sub && <p className="text-xs text-[#475569] mt-0.5">{sub}</p>}
        </div>
    )
}

export default function StatsPage() {
    const [data, setData] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    async function fetchStats() {
        try {
            const res = await fetch("/api/admin/stats")
            if (!res.ok) throw new Error("获取失败")
            const json = (await res.json()) as StatsData
            setData(json)
            setError(null)
        } catch {
            setError("无法加载统计数据，请检查数据库连接")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchStats()
    }

    const maxCount = data
        ? Math.max(...data.dailyStats.map((d) => d.count), 1)
        : 1

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[1.4rem] font-bold tracking-tight text-[#f1f5f9] mb-1">
                        使用统计
                    </h2>
                    <p className="text-sm text-[#94a3b8]">
                        API 调用数据与趋势分析
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/[0.05] disabled:opacity-50 transition-all"
                >
                    <RefreshCw
                        className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                    />
                    刷新
                </button>
            </div>

            {loading && (
                <div className="text-center py-16 text-sm text-[#475569]">
                    加载中...
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-[#f87171]/[0.08] border border-[#f87171]/[0.2] text-sm text-[#f87171]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Cpu />}
                            iconColor="bg-[#3b82f6]/[0.12] text-[#3b82f6]"
                            label="总调用"
                            value={formatNumber(data.overview.total)}
                        />
                        <StatCard
                            icon={<Activity />}
                            iconColor="bg-[#34d399]/[0.12] text-[#34d399]"
                            label="今日调用"
                            value={formatNumber(data.overview.today)}
                            sub={`本周 ${formatNumber(data.overview.week)}`}
                        />
                        <StatCard
                            icon={<CheckCircle />}
                            iconColor="bg-[#8b5cf6]/[0.12] text-[#8b5cf6]"
                            label="成功率"
                            value={`${data.overview.successRate}%`}
                        />
                        <StatCard
                            icon={<Clock />}
                            iconColor="bg-[#fbbf24]/[0.12] text-[#fbbf24]"
                            label="平均耗时"
                            value={`${(data.overview.avgDuration / 1000).toFixed(1)}s`}
                        />
                    </div>

                    {/* Token Usage */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <StatCard
                            icon={<TrendingUp />}
                            iconColor="bg-[#3b82f6]/[0.12] text-[#3b82f6]"
                            label="输入 Tokens"
                            value={formatNumber(data.overview.totalInputTokens)}
                        />
                        <StatCard
                            icon={<Zap />}
                            iconColor="bg-[#fbbf24]/[0.12] text-[#fbbf24]"
                            label="输出 Tokens"
                            value={formatNumber(
                                data.overview.totalOutputTokens,
                            )}
                        />
                    </div>

                    {/* Daily Chart */}
                    <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-4 w-4 text-[#94a3b8]" />
                            <h3 className="text-sm font-semibold text-[#f1f5f9]">
                                近 7 天调用趋势
                            </h3>
                        </div>
                        {data.dailyStats.length === 0 ? (
                            <div className="border border-dashed border-white/[0.1] rounded-xl py-12 text-center text-sm text-[#475569]">
                                暂无数据
                            </div>
                        ) : (
                            <div className="flex items-end gap-2 h-40">
                                {data.dailyStats.map((day) => {
                                    const height = Math.max(
                                        (day.count / maxCount) * 100,
                                        4,
                                    )
                                    const failCount =
                                        day.count - (day.success_count ?? 0)
                                    return (
                                        <div
                                            key={day.date}
                                            className="flex-1 flex flex-col items-center gap-1"
                                        >
                                            <span className="text-[0.65rem] text-[#94a3b8] font-medium">
                                                {day.count}
                                            </span>
                                            <div
                                                className="w-full rounded-t-md bg-[#3b82f6]/80 relative group cursor-default"
                                                style={{
                                                    height: `${height}%`,
                                                }}
                                                title={`${day.date}: ${day.count} 次调用, ${failCount} 次失败`}
                                            >
                                                {failCount > 0 && (
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 bg-[#f87171]/80 rounded-t-md"
                                                        style={{
                                                            height: `${(failCount / day.count) * 100}%`,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[0.6rem] text-[#475569]">
                                                {day.date.slice(5)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Model Distribution & Errors */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Model Distribution */}
                        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">
                                模型使用分布
                            </h3>
                            {data.modelDistribution.length === 0 ? (
                                <div className="text-sm text-[#475569] text-center py-6">
                                    暂无数据
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.modelDistribution.map((m) => {
                                        const pct =
                                            data.overview.total > 0
                                                ? Math.round(
                                                      (m.count /
                                                          data.overview.total) *
                                                          100,
                                                  )
                                                : 0
                                        return (
                                            <div key={m.model}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#94a3b8] truncate mr-2">
                                                        {m.model}
                                                    </span>
                                                    <span className="text-[#475569] shrink-0">
                                                        {m.count} ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#3b82f6] rounded-full"
                                                        style={{
                                                            width: `${pct}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Error Distribution */}
                        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">
                                错误类型分布
                            </h3>
                            {data.errorDistribution.length === 0 ? (
                                <div className="text-sm text-[#475569] text-center py-6">
                                    无错误记录
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.errorDistribution.map((e) => (
                                        <div
                                            key={e.error_type}
                                            className="flex justify-between items-center text-xs"
                                        >
                                            <span className="text-[#f87171] truncate mr-2">
                                                {e.error_type}
                                            </span>
                                            <span className="text-[#475569] shrink-0 bg-[#f87171]/[0.1] px-2 py-0.5 rounded">
                                                {e.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
