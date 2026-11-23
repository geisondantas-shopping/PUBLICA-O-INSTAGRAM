"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";

const MENSAGENS: Record<string, string> = {
  "nao-autorizado": "Este e-mail não tem permissão para acessar o painel.",
  config:
    "Configuração incompleta: faltam as variáveis do Supabase na hospedagem.",
};

export function FormLogin({ erroInicial }: { erroInicial?: string }) {
  const [estado, acao, enviando] = useActionState<EstadoLogin, FormData>(
    entrar,
    {},
  );
  const erro = estado.erro ?? (erroInicial ? MENSAGENS[erroInicial] : undefined);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-base"
        />
      </label>
      {erro && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
