"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailAutorizado } from "@/lib/auth";

export type EstadoLogin = { erro?: string };

export async function entrar(
  _estado: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) return { erro: "Preencha o e-mail e a senha." };

  if (!process.env.ADMIN_EMAIL) {
    return {
      erro: "O painel ainda não tem e-mail autorizado. Cadastre a variável ADMIN_EMAIL na hospedagem.",
    };
  }
  if (!emailAutorizado(email)) {
    return { erro: "Este e-mail não tem permissão para acessar o painel." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    return { erro: (e as Error).message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { erro: "E-mail ou senha incorretos." };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { erro: "Seu e-mail ainda não foi confirmado no Supabase." };
    }
    return { erro: `Não foi possível entrar agora. Detalhe: ${error.message}` };
  }

  redirect("/");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
