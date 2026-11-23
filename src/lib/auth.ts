// Regra de "só eu acesso o painel": além do cadastro público desligado no
// Supabase, só o e-mail de ADMIN_EMAIL pode entrar.
export function emailAutorizado(email: string | undefined | null) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!admin || !email) return false;
  return email.trim().toLowerCase() === admin;
}
