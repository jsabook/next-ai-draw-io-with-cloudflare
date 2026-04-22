import { LoginForm } from "@/components/admin/login-form"
import { FileText } from "lucide-react"

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                            <FileText className="h-7 w-7 text-white" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">
                        AI Draw.io
                    </h1>
                    <p className="text-[#94a3b8] text-sm mt-2">
                        管理后台登录
                    </p>
                </div>

                <div className="bg-[rgba(22,29,48,0.65)] backdrop-blur-xl border border-white/[0.06] rounded-xl p-6">
                    <LoginForm />
                </div>

                <p className="text-center text-xs text-[#475569] mt-6">
                    首次登录将自动创建管理员账号
                </p>
            </div>
        </div>
    )
}
