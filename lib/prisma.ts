import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { config as dotenvConfig } from "dotenv";

// 仅本地开发：从项目根加载 .env / .env.local（向上查找含 package.json 的目录，避免 cwd 不对）
if (process.env.NODE_ENV !== "production") {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const pkg = path.join(dir, "package.json");
    const envLocal = path.join(dir, ".env.local");
    if (fs.existsSync(pkg)) {
      dotenvConfig({ path: path.join(dir, ".env") });
      if (fs.existsSync(envLocal)) dotenvConfig({ path: envLocal, override: true });
      break;
    }
    const parent = path.resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
