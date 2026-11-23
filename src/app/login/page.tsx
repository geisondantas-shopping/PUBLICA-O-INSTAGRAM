import { FormLogin } from "./FormLogin";

export default async function PaginaLogin({
  searchParams,
}: PageProps<"/login">) {
  const { erro } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">PUBLICAÇÃO Aut Geison</h1>
        <p className="mb-6 text-sm text-zinc-500">Entre para acessar o painel.</p>
        <FormLogin erroInicial={typeof erro === "string" ? erro : undefined} />
      </div>
    </main>
  );
}
