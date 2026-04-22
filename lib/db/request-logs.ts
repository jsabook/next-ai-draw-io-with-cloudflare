import { db } from "./client"

export interface RequestLog {
    timestamp: string
    model: string | null
    input_tokens: number | null
    output_tokens: number | null
    duration_ms: number | null
    success: 0 | 1
    session_id: string | null
    error_type: string | null
}

export async function insertRequestLog(log: RequestLog): Promise<void> {
    await db.run(
        `INSERT INTO request_logs
            (timestamp, model, input_tokens, output_tokens, duration_ms, success, session_id, error_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        log.timestamp,
        log.model,
        log.input_tokens,
        log.output_tokens,
        log.duration_ms,
        log.success,
        log.session_id,
        log.error_type,
    )
}
