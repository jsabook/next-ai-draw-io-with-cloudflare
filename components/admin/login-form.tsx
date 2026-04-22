"use client"

import { Loader2 } from "lucide-react"
import { useState } from "react"

export function LoginForm() {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const username = formData.get("username")?.toString().trim()
        const password = formData.get("password")?.toString().trim()

        if (!username || !password) {
            setError("用户名和密码不能为空")
            setIsPending(false)
            return
        }

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            const data = (await res.json()) as {
                success?: boolean
                error?: string
            }

            if (!res.ok || !data.success) {
                setError(data.error || "用户名或密码错误")
                setIsPending(false)
                return
            }

            // 全页面跳转，确保 cookie 已落盘
            window.location.href = "/admin"
        } catch {
            setError("登录失败，请稍后重试")
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="username"
                    className="block text-xs font-medium uppercase tracking-[0.05em] text-[#94a3b8] mb-1.5"
                >
                    用户名
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="请输入用户名"
                    disabled={isPending}
                    required
                    className="w-full px-3.5 py-2.5 text-sm text-[#f1f5f9] bg-[rgba(12,17,32,0.85)] border border-white/[0.06] rounded-lg placeholder:text-[#475569] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:opacity-50 transition-all duration-200"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-xs font-medium uppercase tracking-[0.05em] text-[#94a3b8] mb-1.5"
                >
                    密码
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请输入密码"
                    disabled={isPending}
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
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:shadow-[0_4px_20px_rgba(59,130,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
            >
                {isPending ? (
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
