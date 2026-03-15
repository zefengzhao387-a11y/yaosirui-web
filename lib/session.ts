import { SignJWT, jwtVerify } from "jose";

function getKey() {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing JWT_SECRET");
    }
    return new TextEncoder().encode("dev-secret-key-123456789-timeless-symphony");
  }
  return new TextEncoder().encode(secretKey);
}

export async function encryptSession(payload: unknown) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getKey());
}

export async function decryptSession<T = any>(input: string): Promise<T> {
  const { payload } = await jwtVerify(input, getKey(), { algorithms: ["HS256"] });
  return payload as T;
}
