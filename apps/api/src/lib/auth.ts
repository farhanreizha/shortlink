import { compare, hash } from "bcryptjs"
import { jwtVerify, SignJWT } from "jose"
import { env } from "../config"

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)

export async function hashPassword(password: string) {
  return hash(password, 10)
}

export async function verifyPassword(password: string, hashed: string) {
  return compare(password, hashed)
}

export async function signToken(userId: number) {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload
}
