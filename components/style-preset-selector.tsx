"use client"

import { useState, useRef, useEffect } from "react"
import { Palette, Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StylePresetOption {
    id: string
    label: string
    description: string
}

interface StylePresetSelectorProps {
    presets: StylePresetOption[]
    selectedId: string | null
    onSelect: (id: string | null) => void
    disabled?: boolean
}

export function StylePresetSelector({
    presets,
    selectedId,
    onSelect,
    disabled = false,
}: StylePresetSelectorProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const selected = presets.find((p) => p.id === selectedId) ?? null

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function handleSelect(id: string | null) {
        onSelect(id)
        setOpen(false)
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex items-center gap-1.5 h-8 px-2 rounded-lg text-xs font-medium transition-colors",
                    selected
                        ? "bg-[#8b5cf6]/[0.15] text-[#a78bfa] border border-[#8b5cf6]/[0.25] hover:bg-[#8b5cf6]/[0.2]"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                title={selected ? `风格：${selected.label}` : "选择图表风格"}
            >
                <Palette className="h-3.5 w-3.5 shrink-0" />
                {selected ? (
                    <>
                        <span className="max-w-[80px] truncate">{selected.label}</span>
                        <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                    </>
                ) : (
                    <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                )}
            </button>

            {open && (
                <div className="absolute bottom-full left-0 mb-1.5 w-60 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border/50">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            图表风格
                        </span>
                    </div>

                    <div className="p-1">
                        {/* 无风格选项 */}
                        <button
                            type="button"
                            onClick={() => handleSelect(null)}
                            className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors",
                                !selected
                                    ? "bg-accent text-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <div className="w-5 flex items-center justify-center shrink-0">
                                {!selected && <Check className="h-3.5 w-3.5 text-[#8b5cf6]" />}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-medium">无风格偏向</div>
                                <div className="text-[0.65rem] text-muted-foreground mt-0.5">使用默认系统提示</div>
                            </div>
                        </button>

                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelect(preset.id)}
                                className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors",
                                    selectedId === preset.id
                                        ? "bg-[#8b5cf6]/[0.12] text-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <div className="w-5 flex items-center justify-center shrink-0">
                                    {selectedId === preset.id && (
                                        <Check className="h-3.5 w-3.5 text-[#8b5cf6]" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-medium truncate">{preset.label}</div>
                                    <div className="text-[0.65rem] text-muted-foreground mt-0.5 truncate">
                                        {preset.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selected && (
                        <div className="px-2 pb-2 border-t border-border/50 pt-1">
                            <button
                                type="button"
                                onClick={() => handleSelect(null)}
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                                <X className="h-3 w-3" />
                                清除风格
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
