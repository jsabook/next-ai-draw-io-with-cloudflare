import { jwtVerify, SignJWT } from "jose"

function getJwtSecret(): Uint8Array {
    return new TextEncoder().encode(
        process.env.JWT_SECRET || "default-secret-please-change-in-production",
    )
}

const JWT_ISSUER = "next-ai-draw-io"
const JWT_AUDIENCE = "admin"
const JWT_EXPIRATION = "24h"

export interface JWTPayload {
    userId: number
    username: string
}

export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const salt = crypto.getRandomValues(new Uint8Array(16))

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        data,
        "PBKDF2",
        false,
        ["deriveBits"],
    )

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        256,
    )

    const hashArray = new Uint8Array(derivedBits)
    const saltHex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    const hashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    return `${saltHex}:${hashHex}`
}

export async function verifyPassword(
    password: string,
    storedHash: string,
): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(":")
    if (!saltHex || !hashHex) return false

    const salt = new Uint8Array(
        saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
    )

    const encoder = new TextEncoder()
    const data = encoder.encode(password)

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        data,
        "PBKDF2",
        false,
        ["deriveBits"],
    )

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        256,
    )

    const hashArray = new Uint8Array(derivedBits)
    const computedHashHex = Array.from(hashArray)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    return computedHashHex === hashHex
}

export async function createToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(JWT_ISSUER)
        .setAudience(JWT_AUDIENCE)
        .setExpirationTime(JWT_EXPIRATION)
        .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret(), {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        })
        return {
            userId: payload.userId as number,
            username: payload.username as string,
        }
    } catch {
        return null
    }
}

export const AUTH_COOKIE_NAME = "admin_token"

export function getAuthCookieOptions(isProduction: boolean) {
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict" as const,
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
    }
}
