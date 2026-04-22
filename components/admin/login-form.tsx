"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function LoginForm() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            })

            const data = (await response.json()) as { error?: string }

            if (!response.ok) {
                setError(data.error || "登录失败")
                return
            }

            router.push("/admin")
        } catch {
            setError("网络错误")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-xs font-medium uppercase tracking-[0.05em] text-[#94a3b8] mb-1.5">
                    用户名
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    disabled={loading}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-[#f1f5f9] bg-[rgba(12,17,32,0.85)] border border-white/[0.06] rounded-lg placeholder:text-[#475569] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:opacity-50 transition-all duration-200"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-[0.05em] text-[#94a3b8] mb-1.5">
                    密码
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    disabled={loading}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-[#f1f5f9] bg-[rgba(12,17,32,0.85)] border border-white/[0.06] rounded-lg placeholder:text-[#475569] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:opacity-50 transition-all duration-200"
                />
            </div>

            {error && (
                <div className="text-sm text-[#f87171] bg-[#f87171]/[0.12] px-3.5 py-2.5 rounded-lg border border-[#f87171]/20">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:shadow-[0_4px_20px_rgba(59,130,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>登录中...</span>
                    </>
                ) : (
                    <span>登录</span>
                )}
            </button>
        </form>
    )
}
