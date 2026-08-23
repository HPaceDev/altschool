import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Собирает самодостаточный сервер в .next/standalone: он тянет за собой
   * только реально используемые зависимости, поэтому образ для своего сервера
   * получается небольшим. На Vercel параметр не мешает — там он игнорируется.
   */
  output: "standalone",

  /**
   * Адреса прежнего портала: вход по почте, журнал, скоуп и прочие вкладки,
   * которых больше нет. Ссылки на них остались в закладках и переписке, и
   * упираться в «страница не найдена» там незачем — отправляем на выбор роли.
   */
  async redirects() {
    return [
      "/login",
      "/journal",
      "/decisions",
      "/scope",
      "/risks",
      "/glossary",
      "/spec",
      "/acceptance",
    ].map((source) => ({ source, destination: "/", permanent: false }));
  },
};

export default nextConfig;
