import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Собирает самодостаточный сервер в .next/standalone: он тянет за собой
   * только реально используемые зависимости, поэтому образ для своего сервера
   * получается небольшим. На Vercel параметр не мешает — там он игнорируется.
   */
  output: "standalone",
};

export default nextConfig;
