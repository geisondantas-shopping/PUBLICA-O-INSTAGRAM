import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { emailAutorizado } from "@/lib/auth";

// Caminhos que não exigem login: a tela de login e as rotas chamadas
// pelo Instagram (webhook) e pelo cron da Hostinger, que têm proteção própria.
const CAMINHOS_PUBLICOS = ["/login", "/api/webhook", "/api/cron"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publico = CAMINHOS_PUBLICOS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (publico) return NextResponse.next();
    return redirecionarParaLogin(request, "config");
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Renova a sessão e confirma quem é o usuário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (publico) {
    // Já logado e autorizado? Não precisa ver a tela de login de novo.
    if (pathname === "/login" && user && emailAutorizado(user.email)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return response;
  }

  if (!user) return redirecionarParaLogin(request);

  if (!emailAutorizado(user.email)) {
    await supabase.auth.signOut();
    return redirecionarParaLogin(request, "nao-autorizado");
  }

  return response;
}

function redirecionarParaLogin(request: NextRequest, erro?: string) {
  const destino = new URL("/login", request.url);
  if (erro) destino.searchParams.set("erro", erro);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: [
    // Tudo, menos arquivos estáticos e imagens.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
