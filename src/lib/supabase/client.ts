"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicEnv } from "./env";

// Cliente do navegador: usa só a chave pública (anon). O RLS protege os dados.
export function createClient() {
  const { url, anonKey } = supabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
