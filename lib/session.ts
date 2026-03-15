import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("Missing JWT_SECRET");
}

const key = new TextEncoder().encode(
  secretKey ?? "dev-secret-key-123456789-timeless-symphony"
);

export async function encryptSession(payload: unknown) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decryptSession<T = any>(input: string): Promise<T> {
  const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
  return payload as T;
}

