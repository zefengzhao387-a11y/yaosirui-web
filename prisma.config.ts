import "dotenv/config";
import dotenv from "dotenv";
// 让 Prisma CLI（migrate deploy 等）能读到 .env.local 里的 DATABASE_URL / DIRECT_DATABASE_URL
dotenv.config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env["DIRECT_DATABASE_URL"] ||
      process.env["DATABASE_URL"] ||
      "postgresql://localhost:5432/postgres?schema=public",
  },
});
