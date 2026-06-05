export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[security] TURNSTILE_SECRET_KEY is missing in production");
      return false;
    }
    return true;
  }
  if (!token) {
    return false;
  }

  try {
    const payload = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") {
      payload.set("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
    });

    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
