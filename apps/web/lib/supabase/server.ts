import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

export async function createClient() {
  const { url, key } = getSupabaseConfig();
  const cookieStore = await cookies();

  // A client is created per request; never reuse a user's session across requests.
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. The Proxy refreshes sessions;
          // Server Actions and the callback Route Handler can write them here.
        }
      },
    },
  });
}
