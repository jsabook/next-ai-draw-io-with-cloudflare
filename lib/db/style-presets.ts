import { nanoid } from "nanoid"
import { db } from "./client"

export interface StylePresetMeta {
    id: string
    label: string
    description: string
    prompt_snippet: string
    is_builtin: boolean
    sort_order: number
}

export interface StylePreset extends StylePresetMeta {
    created_at: string
    updated_at: string
}

const BUILTIN_PRESETS: StylePresetMeta[] = [
    {
        id: "aws",
        label: "AWS 架构图",
        description: "使用 AWS 官方图标，按云服务分层布局",
        is_builtin: true,
        sort_order: 0,
        prompt_snippet: `## Diagram Style: AWS Architecture
- ALWAYS call get_shape_library("aws4") before creating any diagram with cloud services
- Use official AWS service icons for all cloud services (EC2, S3, RDS, Lambda, etc.)
- Group services into AWS regions and VPCs using labeled container shapes
- Layout: left-to-right data flow, services grouped by tier (client → API → compute → storage → database)
- Use AWS color conventions: orange for compute, blue for storage/networking, green for management`,
    },
    {
        id: "system-arch",
        label: "系统架构图",
        description: "通用系统架构，服务框、接口与数据流",
        is_builtin: true,
        sort_order: 1,
        prompt_snippet: `## Diagram Style: System Architecture
- Represent services as rectangles, databases as cylinders, caches as parallelograms
- Group components by domain (Frontend / Backend / Data Layer) using labeled container boxes
- Label all arrows with the protocol or data type (REST, gRPC, SQL, MQ, etc.)
- Layout: top-to-bottom or left-to-right flow; keep each layer on the same horizontal or vertical band
- Show load balancers, API gateways, and message queues as distinct shapes`,
    },
    {
        id: "flowchart",
        label: "流程图",
        description: "标准流程图，菱形判断、矩形步骤",
        is_builtin: true,
        sort_order: 2,
        prompt_snippet: `## Diagram Style: Flowchart
- Rectangles for process steps, diamonds for decisions, rounded rectangles for start/end terminals
- All edges must be strictly orthogonal (no diagonal lines)
- Label every decision branch: "Yes/No" or "True/False" or the specific condition
- Single entry point at top, flow generally top-to-bottom
- Use swimlanes when multiple actors or systems are involved`,
    },
    {
        id: "network",
        label: "网络拓扑图",
        description: "网络设备与网段分层拓扑",
        is_builtin: true,
        sort_order: 3,
        prompt_snippet: `## Diagram Style: Network Topology
- Call get_shape_library("cisco19") or get_shape_library("network") to get correct device icons
- Use appropriate network device shapes: router, switch, firewall, server, workstation, cloud
- Group devices by network segment using labeled container boxes; include subnet/VLAN labels
- Label edges with connection type: Ethernet, Fiber, WiFi, VPN, etc.
- Arrange layers top-to-bottom: Internet → Firewall → Core switch → Distribution → Access → Endpoints`,
    },
]

const BUILTIN_IDS = new Set(BUILTIN_PRESETS.map((p) => p.id))

export function getBuiltinPresets(): StylePresetMeta[] {
    return BUILTIN_PRESETS
}

export async function getAllStylePresets(): Promise<StylePresetMeta[]> {
    let dbRows: StylePreset[] = []
    try {
        dbRows = await db.all<StylePreset>(
            "SELECT id, label, description, prompt_snippet, is_builtin, sort_order, created_at, updated_at FROM style_presets ORDER BY sort_order ASC, created_at ASC"
        )
    } catch {
        // D1 not configured — return builtins only
    }

    const dbMap = new Map(dbRows.map((r) => [r.id, r]))

    // Merge: builtins first (D1 row overrides builtin if exists), then custom D1 rows
    const result: StylePresetMeta[] = BUILTIN_PRESETS.map((builtin) => {
        const override = dbMap.get(builtin.id)
        return override ? { ...override, is_builtin: true } : builtin
    })

    for (const row of dbRows) {
        if (!BUILTIN_IDS.has(row.id)) {
            result.push({ ...row, is_builtin: false })
        }
    }

    return result
}

export async function getStylePreset(id: string): Promise<StylePresetMeta | null> {
    // Try D1 first
    try {
        const row = await db.first<StylePreset>(
            "SELECT id, label, description, prompt_snippet, is_builtin, sort_order, created_at, updated_at FROM style_presets WHERE id = ?",
            id
        )
        if (row) return row
    } catch {
        // D1 not configured
    }

    // Fall back to builtin
    return BUILTIN_PRESETS.find((p) => p.id === id) ?? null
}

export async function upsertStylePreset(
    preset: Pick<StylePresetMeta, "id" | "label" | "description" | "prompt_snippet" | "sort_order">
): Promise<void> {
    const isBuiltin = BUILTIN_IDS.has(preset.id) ? 1 : 0
    await db.run(
        `INSERT INTO style_presets (id, label, description, prompt_snippet, is_builtin, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           label = excluded.label,
           description = excluded.description,
           prompt_snippet = excluded.prompt_snippet,
           sort_order = excluded.sort_order,
           updated_at = CURRENT_TIMESTAMP`,
        preset.id,
        preset.label,
        preset.description,
        preset.prompt_snippet,
        isBuiltin,
        preset.sort_order ?? 0
    )
}

export async function createStylePreset(
    input: Pick<StylePresetMeta, "label" | "description" | "prompt_snippet">
): Promise<StylePresetMeta> {
    const id = nanoid()
    const maxOrder = await db.first<{ max_order: number | null }>(
        "SELECT MAX(sort_order) as max_order FROM style_presets"
    )
    const sort_order = (maxOrder?.max_order ?? BUILTIN_PRESETS.length - 1) + 1

    await db.run(
        `INSERT INTO style_presets (id, label, description, prompt_snippet, is_builtin, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        id,
        input.label,
        input.description,
        input.prompt_snippet,
        sort_order
    )

    return {
        id,
        label: input.label,
        description: input.description,
        prompt_snippet: input.prompt_snippet,
        is_builtin: false,
        sort_order,
    }
}

export async function deleteStylePreset(id: string): Promise<void> {
    if (BUILTIN_IDS.has(id)) {
        throw new Error("内置预设不可删除")
    }
    await db.run("DELETE FROM style_presets WHERE id = ?", id)
}

export function isBuiltinPreset(id: string): boolean {
    return BUILTIN_IDS.has(id)
}
