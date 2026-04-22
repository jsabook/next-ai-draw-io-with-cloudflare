"use client"

import { Users, BarChart3, Settings, Layers, Activity, Database, Cpu, Clock } from "lucide-react"

export default function AdminDashboard() {
    return (
        <div className="space-y-7">
            <div>
                <h2 className="text-[1.4rem] font-bold tracking-tight text-[#f1f5f9] mb-1">仪表盘</h2>
                <p className="text-sm text-[#94a3b8]">系统概览与服务状态</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                    icon={<Activity />}
                    iconColor="green"
                    label="状态"
                    value="在线"
                    dot="green"
                />
                <MetricCard
                    icon={<Layers />}
                    iconColor="blue"
                    label="总图表"
                    value="--"
                />
                <MetricCard
                    icon={<Users />}
                    iconColor="purple"
                    label="活跃用户"
                    value="--"
                />
                <MetricCard
                    icon={<Cpu />}
                    iconColor="amber"
                    label="API 调用"
                    value="--"
                />
                <MetricCard
                    icon={<Database />}
                    iconColor="blue"
                    label="存储"
                    value="--"
                    dot="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <InfoCard label="AI 供应商" value="--" />
                <InfoCard label="当前模型" value="--" />
                <InfoCard label="系统版本" value="v0.1.0" />
            </div>

            <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-[#94a3b8]" />
                    <h3 className="text-sm font-semibold text-[#f1f5f9]">近期活动</h3>
                </div>
                <div className="border border-dashed border-white/[0.1] rounded-xl py-12 text-center text-sm text-[#475569]">
                    暂无数据
                </div>
            </div>

            <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">快捷操作</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <ActionButton icon={<Users />} label="用户管理" disabled />
                    <ActionButton icon={<BarChart3 />} label="查看统计" disabled />
                    <ActionButton icon={<Settings />} label="系统设置" disabled />
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    icon,
    iconColor,
    label,
    value,
    dot,
}: {
    icon: React.ReactNode
    iconColor: "blue" | "green" | "purple" | "amber"
    label: string
    value: string
    dot?: "green" | "red"
}) {
    const iconBgColors = {
        blue: "bg-[#3b82f6]/[0.12]",
        green: "bg-[#34d399]/[0.12]",
        purple: "bg-[#8b5cf6]/[0.12]",
        amber: "bg-[#fbbf24]/[0.12]",
    }
    const iconTextColors = {
        blue: "text-[#3b82f6]",
        green: "text-[#34d399]",
        purple: "text-[#8b5cf6]",
        amber: "text-[#fbbf24]",
    }

    return (
        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-0.5">
            <div className={`w-10 h-10 rounded-[10px] ${iconBgColors[iconColor]} flex items-center justify-center mb-3.5 [&>svg]:h-5 [&>svg]:w-5 ${iconTextColors[iconColor]}`}>
                {icon}
            </div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#475569] mb-1.5">{label}</p>
            <p className="text-[1.25rem] font-bold text-[#f1f5f9] flex items-center gap-2">
                {dot && (
                    <span className={`w-2 h-2 rounded-full ${dot === "green" ? "bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-[#f87171] shadow-[0_0_8px_rgba(248,113,113,0.5)]"}`} />
                )}
                {value}
            </p>
        </div>
    )
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 transition-all duration-200 hover:border-white/[0.12]">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#475569] mb-2">{label}</p>
            <p className="text-base font-semibold text-[#f1f5f9]">{value}</p>
        </div>
    )
}

function ActionButton({
    icon,
    label,
    disabled,
}: {
    icon: React.ReactNode
    label: string
    disabled?: boolean
}) {
    return (
        <button
            disabled={disabled}
            className={`
                flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200
                ${disabled
                    ? "text-[#475569] border-white/[0.06] cursor-not-allowed"
                    : "text-[#94a3b8] border-white/[0.06] hover:text-[#f1f5f9] hover:bg-[#3b82f6]/[0.08] hover:border-white/[0.12]"
                }
                [&>svg]:h-4 [&>svg]:w-4 [&>svg]:opacity-70
            `}
        >
            {icon}
            {label}
        </button>
    )
}
