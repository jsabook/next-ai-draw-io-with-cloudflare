"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

interface HeaderProps {
    username?: string
}

export function Header({ username }: HeaderProps) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch("/api/admin/logout", { method: "POST" })
            router.push("/admin/login")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <header className="h-16 bg-[#0f1422] border-b border-white/[0.06] flex items-center justify-between px-8">
            <div>
                <h1 className="text-[1.4rem] font-bold tracking-tight text-[#f1f5f9]">
                    管理后台
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center text-white text-sm font-medium">
                        {username?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <span className="text-sm font-medium text-[#94a3b8]">
                        {username || "Admin"}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#3b82f6]/[0.08] rounded-lg transition-all duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span>退出</span>
                </button>
            </div>
        </header>
    )
}
