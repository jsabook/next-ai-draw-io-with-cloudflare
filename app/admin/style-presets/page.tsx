"use client"

import { useEffect, useRef, useState } from "react"
import {
    Palette,
    ChevronDown,
    ChevronUp,
    Save,
    Trash2,
    Plus,
    Check,
    AlertCircle,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StylePreset {
    id: string
    label: string
    description: string
    prompt_snippet: string
    is_builtin: boolean
    sort_order: number
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

function PresetCard({
    preset,
    onSaved,
    onDeleted,
}: {
    preset: StylePreset
    onSaved: () => void
    onDeleted: () => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [editLabel, setEditLabel] = useState(preset.label)
    const [editDescription, setEditDescription] = useState(preset.description)
    const [editSnippet, setEditSnippet] = useState(preset.prompt_snippet)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
    const [deleteStatus, setDeleteStatus] = useState<SaveStatus>("idle")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        setEditLabel(preset.label)
        setEditDescription(preset.description)
        setEditSnippet(preset.prompt_snippet)
    }, [preset.label, preset.description, preset.prompt_snippet])

    useEffect(() => {
        if (expanded && textareaRef.current) {
            const el = textareaRef.current
            el.style.height = "auto"
            el.style.height = `${el.scrollHeight}px`
        }
    }, [expanded, editSnippet])

    const isDirty =
        editLabel !== preset.label ||
        editDescription !== preset.description ||
        editSnippet !== preset.prompt_snippet

    async function handleSave() {
        setSaveStatus("saving")
        try {
            const res = await fetch("/api/admin/style-presets", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: preset.id,
                    label: editLabel,
                    description: editDescription,
                    prompt_snippet: editSnippet,
                    sort_order: preset.sort_order,
                }),
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

    async function handleDelete() {
        if (!confirm(`确认删除预设「${preset.label}」？此操作不可撤销。`)) return
        setDeleteStatus("saving")
        try {
            const res = await fetch("/api/admin/style-presets", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: preset.id }),
            })
            if (!res.ok) throw new Error()
            setDeleteStatus("saved")
            onDeleted()
        } catch {
            setDeleteStatus("error")
            setTimeout(() => setDeleteStatus("idle"), 2500)
        }
    }

    return (
        <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-200 hover:border-white/[0.1]">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/[0.12] flex items-center justify-center shrink-0">
                        <Palette className="h-4 w-4 text-[#8b5cf6]" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[#f1f5f9]">{preset.label}</span>
                            {preset.is_builtin ? (
                                <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#8b5cf6]/[0.12] text-[#a78bfa] border border-[#8b5cf6]/[0.2]">
                                    内置
                                </span>
                            ) : (
                                <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#34d399]/[0.1] text-[#34d399] border border-[#34d399]/[0.2]">
                                    自定义
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[#475569] mt-0.5 truncate">{preset.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className="text-xs text-[#475569]">
                        {preset.prompt_snippet.length.toLocaleString()} 字符
                    </span>
                    {expanded
                        ? <ChevronUp className="h-4 w-4 text-[#475569]" />
                        : <ChevronDown className="h-4 w-4 text-[#475569]" />
                    }
                </div>
            </button>

            {expanded && (
                <div className="border-t border-white/[0.06] p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-[#475569] mb-1 block">名称</label>
                            <input
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#8b5cf6]/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-[#475569] mb-1 block">描述</label>
                            <input
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] focus:outline-none focus:border-[#8b5cf6]/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-[#475569] mb-1 block">Prompt 片段（注入到系统提示末尾）</label>
                        <textarea
                            ref={textareaRef}
                            value={editSnippet}
                            onChange={(e) => {
                                setEditSnippet(e.target.value)
                                e.target.style.height = "auto"
                                e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg p-3 text-xs text-[#94a3b8] font-mono resize-none focus:outline-none focus:border-[#8b5cf6]/50 leading-relaxed min-h-[160px]"
                            spellCheck={false}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[#475569]">
                            {editSnippet.length.toLocaleString()} 字符
                            {isDirty && <span className="text-amber-400 ml-2">· 未保存</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            {!preset.is_builtin && (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteStatus === "saving"}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#f87171]/[0.2] text-[#f87171] hover:bg-[#f87171]/[0.08] disabled:opacity-50 transition-all"
                                >
                                    {deleteStatus === "error" ? (
                                        <AlertCircle className="h-3 w-3" />
                                    ) : (
                                        <Trash2 className={cn("h-3 w-3", deleteStatus === "saving" && "animate-pulse")} />
                                    )}
                                    {deleteStatus === "error" ? "删除失败" : "删除"}
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saveStatus === "saving" || !isDirty}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            )}
        </div>
    )
}

function NewPresetForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
    const [label, setLabel] = useState("")
    const [description, setDescription] = useState("")
    const [snippet, setSnippet] = useState("")
    const [status, setStatus] = useState<SaveStatus>("idle")

    async function handleCreate() {
        if (!label.trim() || !description.trim() || !snippet.trim()) return
        setStatus("saving")
        try {
            const res = await fetch("/api/admin/style-presets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label: label.trim(), description: description.trim(), prompt_snippet: snippet.trim() }),
            })
            if (!res.ok) throw new Error()
            setStatus("saved")
            onCreated()
        } catch {
            setStatus("error")
            setTimeout(() => setStatus("idle"), 2500)
        }
    }

    return (
        <div className="bg-[rgba(22,29,48,0.85)] backdrop-blur-xl border border-[#8b5cf6]/[0.2] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#f1f5f9]">新增自定义预设</span>
                <button onClick={onCancel} className="text-[#475569] hover:text-[#94a3b8]">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-[#475569] mb-1 block">名称 *</label>
                    <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="如：UML 类图"
                        className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#8b5cf6]/50"
                    />
                </div>
                <div>
                    <label className="text-xs text-[#475569] mb-1 block">描述 *</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="一句话说明该风格的用途"
                        className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#8b5cf6]/50"
                    />
                </div>
            </div>
            <div>
                <label className="text-xs text-[#475569] mb-1 block">Prompt 片段 *</label>
                <textarea
                    value={snippet}
                    onChange={(e) => setSnippet(e.target.value)}
                    placeholder="描述该风格的绘图规范，AI 生成图表时会遵循这些规则..."
                    rows={6}
                    className="w-full bg-[#0b0f1a] border border-white/[0.08] rounded-lg p-3 text-xs text-[#94a3b8] font-mono resize-none focus:outline-none focus:border-[#8b5cf6]/50 leading-relaxed placeholder-[#334155]"
                    spellCheck={false}
                />
            </div>
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/[0.05] transition-all"
                >
                    取消
                </button>
                <button
                    onClick={handleCreate}
                    disabled={status === "saving" || !label.trim() || !description.trim() || !snippet.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {status === "saved" ? (
                        <Check className="h-3 w-3" />
                    ) : status === "error" ? (
                        <AlertCircle className="h-3 w-3" />
                    ) : (
                        <Plus className={cn("h-3 w-3", status === "saving" && "animate-pulse")} />
                    )}
                    {status === "error" ? "创建失败" : "创建"}
                </button>
            </div>
        </div>
    )
}

export default function StylePresetsPage() {
    const [presets, setPresets] = useState<StylePreset[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showNewForm, setShowNewForm] = useState(false)

    async function fetchPresets() {
        try {
            const res = await fetch("/api/admin/style-presets")
            if (!res.ok) throw new Error("获取失败")
            const data = await res.json() as { presets: StylePreset[] }
            setPresets(data.presets)
            setError(null)
        } catch {
            setError("无法加载风格预设，请检查数据库连接")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPresets()
    }, [])

    const builtinCount = presets.filter((p) => p.is_builtin).length
    const customCount = presets.filter((p) => !p.is_builtin).length

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-[1.4rem] font-bold tracking-tight text-[#f1f5f9] mb-1">风格预设</h2>
                    <p className="text-sm text-[#94a3b8]">
                        管理图表风格预设，用户在聊天界面选择后 AI 将遵循对应风格生成图表
                        {!loading && (
                            <span className="ml-2 text-[#475569]">
                                · {builtinCount} 个内置 · {customCount} 个自定义
                            </span>
                        )}
                    </p>
                </div>
                {!loading && !error && (
                    <button
                        onClick={() => setShowNewForm(true)}
                        disabled={showNewForm}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] disabled:opacity-50 transition-all shrink-0"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        新增预设
                    </button>
                )}
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
                    {showNewForm && (
                        <NewPresetForm
                            onCreated={() => { setShowNewForm(false); fetchPresets() }}
                            onCancel={() => setShowNewForm(false)}
                        />
                    )}
                    {presets.map((preset) => (
                        <PresetCard
                            key={preset.id}
                            preset={preset}
                            onSaved={fetchPresets}
                            onDeleted={fetchPresets}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
