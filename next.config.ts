const nextConfig = {
  reactStrictMode: true,
  // 确保 API 路由能读到 .env.local 中的 AI Key（诗意引言用 OpenAI 兼容 API）
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL ?? "",
    AI_POETIC_MODEL: process.env.AI_POETIC_MODEL ?? "",
  },
};

export default nextConfig;
