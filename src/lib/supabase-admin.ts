import { createClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServerConfigured = Boolean(supabaseUrl && anonKey);

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && serviceRoleKey && serviceRoleKey !== anonKey
);

export function getSupabaseAdmin() {
  if (!isSupabaseAdminConfigured) return null;
  return createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSupabaseForRequest(req: NextRequest) {
  const token = getBearerToken(req);
  if (!isSupabaseServerConfigured || !token) return null;
  return createClient(supabaseUrl as string, anonKey as string, {
    accessToken: async () => token,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getSupabaseAuthClient() {
  if (!isSupabaseServerConfigured) return null;
  return createClient(supabaseUrl as string, anonKey as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export async function getUserFromRequest(
  req: NextRequest
): Promise<{ user: User | null; error?: string }> {
  const token = getBearerToken(req);
  if (!token) return { user: null, error: "Missing session token." };

  const supabase = getSupabaseAuthClient();
  if (!supabase) return { user: null, error: "Supabase is not configured." };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, error: "Invalid or expired session." };
  }

  return { user: data.user };
}
