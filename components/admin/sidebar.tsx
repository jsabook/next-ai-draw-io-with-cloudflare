"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Settings,
    FileText,
    FileCode2,
    Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    {
        title: "仪表盘",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "提示词管理",
        href: "/admin/prompts",
        icon: FileCode2,
    },
    {
        title: "风格预设",
        href: "/admin/style-presets",
        icon: Palette,
    },
    {
        title: "用户管理",
        href: "/admin/users",
        icon: Users,
        disabled: true,
    },
    {
        title: "使用统计",
        href: "/admin/stats",
        icon: BarChart3,
        disabled: true,
    },
    {
        title: "系统设置",
        href: "/admin/settings",
        icon: Settings,
        disabled: true,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-60 h-screen bg-[#0f1422] flex flex-col border-r border-white/[0.06] shrink-0">
            <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.25)]">
                    <FileText className="h-[18px] w-[18px] text-white" />
                </div>
                <span className="font-bold text-[0.95rem] tracking-tight bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                    AI Draw.io
                </span>
            </div>

            <nav className="flex-1 py-4 px-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#475569] px-3 mb-2">
                    概览
                </p>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.href}>
                                {item.disabled ? (
                                    <span className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-[#475569] cursor-not-allowed rounded-lg">
                                        <item.icon className="h-[18px] w-[18px] opacity-70" />
                                        <span>{item.title}</span>
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-[#3b82f6]/[0.12] text-[#3b82f6] border border-[#3b82f6]/[0.15]"
                                                : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#3b82f6]/[0.08] border border-transparent"
                                        )}
                                    >
                                        <item.icon className={cn("h-[18px] w-[18px]", isActive ? "opacity-100" : "opacity-70")} />
                                        <span>{item.title}</span>
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="px-4 py-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-[#475569]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                    <span>在线</span>
                </div>
            </div>
        </aside>
    )
}
