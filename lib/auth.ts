import { cookies } from "next/headers";
import { decryptSession, encryptSession } from "@/lib/session";

export async function createSession(user: { id: string; email: string; name: string | null }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encryptSession({ user });

  const cookieStore = await cookies();
  cookieStore.set("session", session, { 
    expires, 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return session;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0), path: "/" });
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    return await decryptSession(session);
  } catch (err) {
    return null;
  }
}
