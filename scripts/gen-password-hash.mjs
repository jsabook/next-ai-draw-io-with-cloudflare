/**
 * Usage: node scripts/gen-password-hash.mjs <password>
 * Generates PBKDF2 hash compatible with lib/auth.ts hashPassword()
 */
const password = process.argv[2]
if (!password) {
    console.error("Usage: node scripts/gen-password-hash.mjs <password>")
    process.exit(1)
}

const encoder = new TextEncoder()
const data = encoder.encode(password)
const salt = crypto.getRandomValues(new Uint8Array(16))

const keyMaterial = await crypto.subtle.importKey("raw", data, "PBKDF2", false, ["deriveBits"])
const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256,
)

const hashArray = new Uint8Array(derivedBits)
const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("")
const hashHex = Array.from(hashArray).map((b) => b.toString(16).padStart(2, "0")).join("")
const result = `${saltHex}:${hashHex}`

console.log("\n生成的密码哈希：")
console.log(result)
console.log("\n请将以下内容添加到 .env.local 文件：")
console.log(`ADMIN_USERNAME=admin`)
console.log(`ADMIN_PASSWORD_HASH=${result}`)
