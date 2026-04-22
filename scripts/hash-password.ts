import { hashPassword } from "../lib/auth"

const password = process.argv[2]

if (!password) {
    console.error("Usage: npx tsx scripts/hash-password.ts <password>")
    process.exit(1)
}

hashPassword(password).then((hash) => {
    console.log("\nPassword hash generated:")
    console.log(hash)
    console.log("\nAdd this to your .env file:")
    console.log(`ADMIN_PASSWORD_HASH=${hash}`)
})
