import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PUBLICAÇÃO Aut Geison",
  description: "Painel de publicação automática no Instagram",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
