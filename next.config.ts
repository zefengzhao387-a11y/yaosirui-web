const nextConfig = {
  reactStrictMode: true,
  // 确保 API 路由能读到 .env.local 中的 Gemini Key（本地 dev 有时读不到）
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  },
};

export default nextConfig;
