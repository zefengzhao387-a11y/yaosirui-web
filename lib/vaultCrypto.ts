export async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 150_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(plain: string, password: string) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plain)
  );
  const toB64 = (buf: ArrayBuffer | Uint8Array) => {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let str = "";
    bytes.forEach((b) => {
      str += String.fromCharCode(b);
    });
    return btoa(str);
  };
  return {
    ciphertext: toB64(ciphertext),
    iv: toB64(iv),
    salt: toB64(salt),
  };
}

export async function decryptText(ciphertextB64: string, password: string, ivB64: string, saltB64: string) {
  const dec = new TextDecoder();
  const fromB64 = (b64: string) =>
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const salt = fromB64(saltB64);
  const iv = fromB64(ivB64);
  const data = fromB64(ciphertextB64);
  const key = await deriveKey(password, salt);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return dec.decode(plainBuf);
}

