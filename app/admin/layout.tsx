import "@/app/globals.css"
import { Plus_Jakarta_Sans } from "next/font/google"
import { DashboardLayout } from "@/components/admin/dashboard-layout"

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
})

export const metadata = {
    title: "管理后台 - AI Draw.io",
    description: "AI Draw.io 管理后台",
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
            <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
                <DashboardLayout>{children}</DashboardLayout>
            </body>
        </html>
    )
}
