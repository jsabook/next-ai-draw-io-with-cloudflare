"use client"

import { useEffect, useRef, useState } from "react"
import { FileCode2, RotateCcw, Save, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptItem {
    key: string
    label: string
    description: string
    defaultContent: string
    overrideContent: string | null
    isOverridden: boolean
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

function PromptCard({ prompt, onSaved }: { prompt: PromptItem; onSaved: () => void }) {
    const [expanded, setExpanded] = useState(false)
    const [editContent, setEditContent] = useState(prompt.overrideContent ?? prompt.defaultContent)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
    const [resetStatus, setResetStatus] = useState<SaveStatus>("idle")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Sync edit content when prompt changes externally
    useEffect(() => {
        setEditContent(prompt.overrideContent ?? prompt.defaultContent)
    }, [prompt.overrideContent, prompt.defaultContent])

    // Auto-resize textarea
    useEffect(() => {
        if (expanded && textareaRef.current) {
            const el = textareaRef.current
            el.style.height = "auto"
            el.style.height = `${el.scrollHeight}px`
        }
    }, [expanded, editContent])

    const activeContent = prompt.overrideContent ?? prompt.defaultContent
    const isDirty = editContent !== activeContent

    async function handleSave() {
        setSaveStatus("saving")
        try {
            const res = await fetch("/api/admin/prompts", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: prompt.key, content: editContent }),
            })
            if (!res.ok) throw new Error()
            setSaveStatus("saved")
            onSaved()
            setTimeout(() => setSaveStatus("idle"), 2000)
        } catch {
            setSaveStatus("error")
            setTimeout(() => setSaveStatus("idle"), 2500)
        }
    }

    async function handleReset() {
        setResetStatus("saving")
        try {
            const res = await fetch("/api/admin/prompts", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: prompt.key }),
            })
            if (!res.ok) throw new Error()
            setResetStatus("saved")
            onSaved()
            setTimeout(() => setResetStatus("idle"), 2000)
        } catch {
            setResetStatus("error")
            setTimeout(() => setResetStatus("idle"), 2500)
        }
    }

    return (
        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-200 hover:border-white/[0.1]">
            {/* Header */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/[0.12] flex items-center justify-center shrink-0">
                        <FileCode2 className="h-4 w-4 text-[#3b82f6]" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[#f1f5f9]">{prompt.label}</span>
                            {prompt.isOverridden ? (
                                <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/[0.15] text-amber-400 border border-amber-500/[0.2]">
                                    已覆盖
                                </span>
                            ) : (
                                <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.05] text-[#475569] border border-white/[0.06]">
                                    默认
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[#475569] mt-0.5 truncate">{prompt.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-xs text-[#475569]">
                        {(prompt.overrideContent ?? prompt.defaultContent).length.toLocaleString()} 字符
                    </span>
                    {expanded
                        ? <ChevronUp className="h-4 w-4 text-[#475569]" />
                        : <ChevronDown className="h-4 w-4 text-[#475569]" />
                    }
                </div>
            </button>

            {/* Editor */}
            {expanded && (
                <div className="border-t border-white/[0.06]">
                    <div className="p-4">
                        <textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => {
                                setEditContent(e.target.value)
                                // Auto-resize
                                e.target.style.height = "auto"
                                e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg p-3 text-xs text-[#94a3b8] font-mono resize-none focus:outline-none focus:border-[#3b82f6]/50 leading-relaxed min-h-[200px]"
                            spellCheck={false}
                        />
                        <div className="flex items-center justify-between mt-3 gap-3">
                            <span className="text-xs text-[#475569]">
                                {editContent.length.toLocaleString()} 字符
                                {isDirty && <span className="text-amber-400 ml-2">· 未保存</span>}
                            </span>
                            <div className="flex items-center gap-2">
                                {prompt.isOverridden && (
                                    <button
                                        onClick={handleReset}
                                        disabled={resetStatus === "saving"}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/[0.05] disabled:opacity-50 transition-all"
                                    >
                                        {resetStatus === "saved" ? (
                                            <Check className="h-3 w-3 text-[#34d399]" />
                                        ) : resetStatus === "error" ? (
                                            <AlertCircle className="h-3 w-3 text-[#f87171]" />
                                        ) : (
                                            <RotateCcw className={cn("h-3 w-3", resetStatus === "saving" && "animate-spin")} />
                                        )}
                                        {resetStatus === "saved" ? "已重置" : resetStatus === "error" ? "失败" : "重置默认"}
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={saveStatus === "saving" || !isDirty}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {saveStatus === "saved" ? (
                                        <Check className="h-3 w-3" />
                                    ) : saveStatus === "error" ? (
                                        <AlertCircle className="h-3 w-3" />
                                    ) : (
                                        <Save className={cn("h-3 w-3", saveStatus === "saving" && "animate-pulse")} />
                                    )}
                                    {saveStatus === "saved" ? "已保存" : saveStatus === "error" ? "保存失败" : "保存"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<PromptItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function fetchPrompts() {
        try {
            const res = await fetch("/api/admin/prompts")
            if (!res.ok) throw new Error("获取失败")
            const data = await res.json() as { prompts: PromptItem[] }
            setPrompts(data.prompts)
            setError(null)
        } catch {
            setError("无法加载提示词，请检查数据库连接")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPrompts()
    }, [])

    const overriddenCount = prompts.filter((p) => p.isOverridden).length

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-[1.4rem] font-bold tracking-tight text-[#f1f5f9] mb-1">提示词管理</h2>
                <p className="text-sm text-[#94a3b8]">
                    实时修改 AI 提示词，保存后立即生效，无需重启服务
                    {!loading && prompts.length > 0 && (
                        <span className="ml-2 text-[#475569]">
                            · {overriddenCount > 0 ? `${overriddenCount} 个已覆盖` : "全部使用默认值"}
                        </span>
                    )}
                </p>
            </div>

            {loading && (
                <div className="text-center py-16 text-sm text-[#475569]">加载中...</div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-[#f87171]/[0.08] border border-[#f87171]/[0.2] text-sm text-[#f87171]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-3">
                    {prompts.map((prompt) => (
                        <PromptCard
                            key={prompt.key}
                            prompt={prompt}
                            onSaved={fetchPrompts}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
