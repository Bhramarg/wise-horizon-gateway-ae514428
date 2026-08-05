import { neon } from "@neondatabase/serverless";
import { useSession } from "@tanstack/react-start/server";

export type SessionUser = { id: string; email: string; name: string; provider: string };

function sql() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const db = sql();
    schemaReady = (async () => {
      await db`
        create table if not exists wise_users (
          id uuid primary key default gen_random_uuid(),
          email text unique not null,
          name text not null default '',
          organisation text not null default '',
          password_hash text,
          provider text not null default 'password',
          created_at timestamptz not null default now(),
          last_login_at timestamptz
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

const ITERATIONS = 100_000;

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

async function derive(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations: ITERATIONS },
    key,
    256,
  );
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derive(password, salt);
  return `pbkdf2$${ITERATIONS}$${toHex(salt.buffer as ArrayBuffer)}$${toHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [scheme, , saltHex, hashHex] = stored.split("$");
  if (scheme !== "pbkdf2" || !saltHex || !hashHex) return false;
  const bits = await derive(password, fromHex(saltHex));
  return toHex(bits) === hashHex;
}

type DbUser = {
  id: string;
  email: string;
  name: string;
  organisation: string;
  password_hash: string | null;
  provider: string;
};

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  await ensureSchema();
  const rows = (await sql()`
    select id, email, name, organisation, password_hash, provider
    from wise_users where email = ${email.toLowerCase()} limit 1
  `) as DbUser[];
  return rows[0];
}

export async function createUser(input: {
  email: string;
  name: string;
  organisation?: string;
  passwordHash?: string | null;
  provider?: string;
}): Promise<DbUser> {
  await ensureSchema();
  const rows = (await sql()`
    insert into wise_users (email, name, organisation, password_hash, provider)
    values (${input.email.toLowerCase()}, ${input.name}, ${input.organisation ?? ""},
            ${input.passwordHash ?? null}, ${input.provider ?? "password"})
    returning id, email, name, organisation, password_hash, provider
  `) as DbUser[];
  return rows[0]!;
}

export async function touchLogin(id: string) {
  await sql()`update wise_users set last_login_at = now() where id = ${id}`;
}

function sessionConfig() {
  const password = process.env["SESSION_SECRET"];
  if (!password) throw new Error("SESSION_SECRET is not configured");
  return { password, name: "wise-session", maxAge: 60 * 60 * 24 * 7 };
}

export async function readSession() {
  const session = await useSession<{ user?: SessionUser }>(sessionConfig());
  return session.data.user ?? null;
}

export async function writeSession(user: SessionUser) {
  const session = await useSession<{ user?: SessionUser }>(sessionConfig());
  await session.update({ user });
}

export async function destroySession() {
  const session = await useSession<{ user?: SessionUser }>(sessionConfig());
  await session.clear();
}
