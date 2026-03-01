import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import db from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;
const COOKIE_NAME = "pharma-auth";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

// ==================== PASSWORD ====================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==================== JWT ====================

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ==================== COOKIE HELPERS ====================

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// ==================== AUTH USER ====================

export type AuthUser = {
  id: number;
  fullName: string;
  organization: string;
  email: string | null;
  phone: string;
  role: "manufacturer" | "distributor" | "pharmacist" | "admin";
  walletId: string;
};

/**
 * Get the currently authenticated user from the JWT cookie.
 * Returns null if no valid session exists.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const users = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      organization: usersTable.organization,
      email: usersTable.email,
      phone: usersTable.phone,
      role: usersTable.role,
      walletId: usersTable.walletId,
    })
    .from(usersTable)
    .where(eq(usersTable.id, payload.userId));

  if (users.length === 0) return null;

  return users[0];
}
