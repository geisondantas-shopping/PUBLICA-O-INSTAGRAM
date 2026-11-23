import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailAutorizado } from "@/lib/auth";
import { sair } from "@/app/login/actions";

const MENU = [
  { href: "/", rotulo: "Início" },
  { href: "/novo-post", rotulo: "Novo post" },
  { href: "/calendario", rotulo: "Calendário" },
  { href: "/automacoes", rotulo: "Automações" },
  { href: "/interacoes", rotulo: "Interações" },
  { href: "/saude", rotulo: "Saúde" },
];

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  // Segunda trava (além do proxy): sem usuário autorizado, volta para o login.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !emailAutorizado(user.email)) redirect("/login");

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-white md:w-56 md:border-b-0 md:border-r">
        <div className="p-4 font-semibold">PUBLICAÇÃO Aut Geison</div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
            >
              {item.rotulo}
            </Link>
          ))}
        </nav>
        <form action={sair} className="px-4 pb-4 md:mt-4">
          <p className="mb-2 truncate text-xs text-zinc-500">{user.email}</p>
          <button className="text-sm text-red-700 hover:underline">Sair</button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
