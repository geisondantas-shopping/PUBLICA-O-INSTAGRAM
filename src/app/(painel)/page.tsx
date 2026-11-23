import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Resultado = { nome: string; ok: boolean; detalhe: string };

const TABELAS = ["posts", "automacoes", "interacoes", "logs"] as const;

async function verificar(): Promise<Resultado[]> {
  const resultados: Resultado[] = [];
  const supabase = await createClient();

  for (const tabela of TABELAS) {
    const { count, error } = await supabase
      .from(tabela)
      .select("*", { count: "exact", head: true });
    resultados.push({
      nome: `Tabela ${tabela}`,
      ok: !error,
      detalhe: error ? traduzir(error.message) : `${count ?? 0} registro(s)`,
    });
  }

  // A tabela config só pode ser lida pelo servidor (chave service_role).
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("config").select("id").limit(1);
    resultados.push({
      nome: "Tabela config (protegida)",
      ok: !error,
      detalhe: error ? traduzir(error.message) : "acessível só pelo servidor",
    });
    const { data, error: erroBucket } = await admin.storage.getBucket("midias");
    resultados.push({
      nome: "Pasta de mídias (Storage)",
      ok: !erroBucket && !!data?.public,
      detalhe: erroBucket
        ? traduzir(erroBucket.message)
        : data?.public
          ? "bucket público criado"
          : "o bucket existe, mas não está público",
    });
  } catch (e) {
    resultados.push({
      nome: "Chave do servidor",
      ok: false,
      detalhe: (e as Error).message,
    });
  }

  return resultados;
}

function traduzir(msg: string) {
  if (/does not exist|schema cache|not found/i.test(msg)) {
    return "não encontrada. Rode o arquivo SQL da Etapa 1 no Supabase.";
  }
  if (/invalid api key|jwt/i.test(msg)) return "chave do Supabase inválida.";
  return msg;
}

export default async function Inicio() {
  const resultados = await verificar();
  const tudoOk = resultados.every((r) => r.ok);

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold">Início</h1>
      <p className="mb-6 text-zinc-600">
        Verificação da Etapa 1: login, banco e armazenamento.
      </p>
      <div
        className={`mb-4 rounded-md px-4 py-3 text-sm font-medium ${
          tudoOk ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {tudoOk
          ? "Tudo certo: você está logado e o banco está pronto."
          : "Há itens pendentes. Veja abaixo o que falta."}
      </div>
      <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 bg-white">
        {resultados.map((r) => (
          <li key={r.nome} className="flex items-start gap-3 px-4 py-3 text-sm">
            <span aria-hidden>{r.ok ? "✅" : "❌"}</span>
            <div>
              <div className="font-medium">{r.nome}</div>
              <div className="text-zinc-500">{r.detalhe}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
