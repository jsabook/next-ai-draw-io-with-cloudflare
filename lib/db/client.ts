function getConfig() {
    const accountId = process.env.CF_ACCOUNT_ID
    const databaseId = process.env.CF_D1_DATABASE_ID
    const apiToken = process.env.CF_API_TOKEN

    if (!accountId || !databaseId || !apiToken) {
        throw new Error(
            "Missing Cloudflare D1 config: CF_ACCOUNT_ID, CF_D1_DATABASE_ID, CF_API_TOKEN"
        )
    }

    return { accountId, databaseId, apiToken }
}

async function d1Query(sql: string, params: unknown[] = []) {
    const { accountId, databaseId, apiToken } = getConfig()

    const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql, params }),
        }
    )

    if (!res.ok) {
        throw new Error(`D1 HTTP error: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as {
        success: boolean
        errors: { message: string }[]
        result: Array<{ results: unknown[] }>
    }

    if (!data.success) {
        throw new Error(
            `D1 query error: ${data.errors.map((e) => e.message).join(", ")}`
        )
    }

    return data.result[0]
}

export const db = {
    first: async <T>(sql: string, ...params: unknown[]): Promise<T | null> => {
        const result = await d1Query(sql, params)
        return (result.results[0] as T) ?? null
    },

    all: async <T>(sql: string, ...params: unknown[]): Promise<T[]> => {
        const result = await d1Query(sql, params)
        return result.results as T[]
    },

    run: async (sql: string, ...params: unknown[]): Promise<void> => {
        await d1Query(sql, params)
    },
}
