import { hashPassword } from "../auth"
import { db } from "./client"

export interface AdminUser {
    id: number
    username: string
    password_hash: string
    created_at: string
    last_login_at: string | null
}

export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
    return db.first<AdminUser>("SELECT * FROM admin_users WHERE username = ?", username)
}

export async function getAdminById(id: number): Promise<AdminUser | null> {
    return db.first<AdminUser>("SELECT * FROM admin_users WHERE id = ?", id)
}

export async function createAdmin(username: string, password: string): Promise<AdminUser | null> {
    const passwordHash = await hashPassword(password)
    await db.run(
        "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
        username,
        passwordHash
    )
    return getAdminByUsername(username)
}

export async function updateLastLogin(userId: number): Promise<void> {
    await db.run(
        "UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
        userId
    )
}

export async function getAllAdmins(): Promise<AdminUser[]> {
    return db.all<AdminUser>(
        "SELECT id, username, created_at, last_login_at FROM admin_users ORDER BY created_at DESC"
    )
}

export async function deleteAdmin(id: number): Promise<void> {
    await db.run("DELETE FROM admin_users WHERE id = ?", id)
}

export async function getAdminCount(): Promise<number> {
    const row = await db.first<{ count: number }>("SELECT COUNT(*) as count FROM admin_users")
    return row?.count ?? 0
}
