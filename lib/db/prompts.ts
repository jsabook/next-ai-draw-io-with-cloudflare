import {
    DEFAULT_SYSTEM_PROMPT,
    EXTENDED_SYSTEM_PROMPT,
    STYLE_INSTRUCTIONS,
    MINIMAL_STYLE_INSTRUCTION,
} from "@/lib/system-prompts"
import { VALIDATION_SYSTEM_PROMPT } from "@/lib/validation-prompts"
import { db } from "./client"

export interface PromptMeta {
    key: string
    label: string
    description: string
    defaultContent: string
}

export const PROMPT_DEFINITIONS: PromptMeta[] = [
    {
        key: "DEFAULT_SYSTEM_PROMPT",
        label: "默认系统提示词",
        description: "核心系统提示，约 1900 tokens，所有模型默认使用",
        defaultContent: DEFAULT_SYSTEM_PROMPT,
    },
    {
        key: "EXTENDED_SYSTEM_PROMPT",
        label: "扩展系统提示词",
        description: "约 4400 tokens，Opus 4.5 / Haiku 4.5 等需要更多缓存 token 的模型专用",
        defaultContent: EXTENDED_SYSTEM_PROMPT,
    },
    {
        key: "STYLE_INSTRUCTIONS",
        label: "样式规范",
        description: "颜色、形状、边的样式说明，普通模式下追加到系统提示末尾",
        defaultContent: STYLE_INSTRUCTIONS,
    },
    {
        key: "MINIMAL_STYLE_INSTRUCTION",
        label: "极简样式提示词",
        description: "极简模式下前置到系统提示头部，禁用所有颜色只允许纯黑白",
        defaultContent: MINIMAL_STYLE_INSTRUCTION,
    },
    {
        key: "VALIDATION_SYSTEM_PROMPT",
        label: "图表验证提示词",
        description: "用于 VLM 检测图表质量问题（重叠、边路由、文字可读性等）",
        defaultContent: VALIDATION_SYSTEM_PROMPT,
    },
]

export interface PromptOverride {
    key: string
    content: string
    updated_at: string
}

export async function getAllPromptOverrides(): Promise<Record<string, string>> {
    const rows = await db.all<{ key: string; content: string }>(
        "SELECT key, content FROM prompt_overrides"
    )
    const overrides: Record<string, string> = {}
    for (const row of rows) {
        overrides[row.key] = row.content
    }
    return overrides
}

export async function getPromptOverride(key: string): Promise<PromptOverride | null> {
    return db.first<PromptOverride>(
        "SELECT key, content, updated_at FROM prompt_overrides WHERE key = ?",
        key
    )
}

export async function upsertPromptOverride(key: string, content: string): Promise<void> {
    await db.run(
        `INSERT INTO prompt_overrides (key, content, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP`,
        key,
        content
    )
}

export async function deletePromptOverride(key: string): Promise<void> {
    await db.run("DELETE FROM prompt_overrides WHERE key = ?", key)
}
