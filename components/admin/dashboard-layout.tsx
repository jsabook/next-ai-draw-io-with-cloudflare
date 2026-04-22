"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface User {
    id: number
    username: string
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const isLoginPage = pathname === "/admin/login"

    useEffect(() => {
        if (!isLoginPage) {
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [isLoginPage])

    const fetchUser = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/me")
            if (response.ok) {
                const data = (await response.json()) as { user: User }
                setUser(data.user)
            } else {
                router.push("/admin/login")
            }
        } catch {
            router.push("/admin/login")
        } finally {
            setLoading(false)
        }
    }

    if (isLoginPage) {
        return <>{children}</>
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
                <div className="text-[#94a3b8] text-sm">加载中...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-[#0b0f1a]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <Header username={user?.username} />
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
