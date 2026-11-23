import "server-only";

import { createClient } from "@supabase/supabase-js";

// Cliente com a chave service_role: ignora o RLS.
// Use SOMENTE em código de servidor (rotas de API, cron, webhook).
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Configuração incompleta: preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
