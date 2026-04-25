export async function register() {
    if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
        console.warn(
            "[Langfuse] Environment variables not configured - telemetry disabled",
        )
        return
    }

    try {
        const { LangfuseSpanProcessor } = await import("@langfuse/otel")
        const { NodeTracerProvider } = await import(
            "@opentelemetry/sdk-trace-node"
        )

        const langfuseSpanProcessor = new LangfuseSpanProcessor({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY,
            secretKey: process.env.LANGFUSE_SECRET_KEY,
            baseUrl: process.env.LANGFUSE_BASEURL,
            shouldExportSpan: ({ otelSpan }) => {
                const spanName = otelSpan.name
                if (spanName === "chat" || spanName.startsWith("ai.")) {
                    return true
                }
                return false
            },
        })

        const tracerProvider = new NodeTracerProvider({
            spanProcessors: [langfuseSpanProcessor],
        })

        tracerProvider.register()
        console.log("[Langfuse] Instrumentation initialized successfully")
    } catch {
        console.warn(
            "[Langfuse] OpenTelemetry not available in this runtime - telemetry disabled",
        )
    }
}
