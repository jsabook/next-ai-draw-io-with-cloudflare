import { readFileSync } from "fs"
import { resolve } from "path"
import { config } from "dotenv"

config({ path: resolve(process.cwd(), ".env.local") })

const accountId = process.env.CF_ACCOUNT_ID
const databaseId = process.env.CF_D1_DATABASE_ID
const apiToken = process.env.CF_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN

if (!accountId || !databaseId || !apiToken) {
    console.warn("跳过迁移：未配置 CF_ACCOUNT_ID / CF_D1_DATABASE_ID / CF_API_TOKEN")
    process.exit(0)
}

const sql = readFileSync(resolve(process.cwd(), "lib/db/schema.sql"), "utf-8")

// Split by semicolons, filter empty statements
const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

async function execute(statement: string) {
    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql: statement }),
        }
    )
    const data = (await res.json()) as { success: boolean; errors: { message: string }[] }
    if (!data.success) {
        throw new Error(data.errors.map((e) => e.message).join(", "))
    }
}

async function main() {
    console.log(`执行 ${statements.length} 条 SQL 语句...`)
    for (const stmt of statements) {
        try {
            await execute(stmt)
            console.log(`✓ ${stmt.substring(0, 60).replace(/\s+/g, " ")}...`)
        } catch (err) {
            console.error(`✗ 失败: ${err}`)
            process.exit(1)
        }
    }
    console.log("迁移完成！")
}

main()
