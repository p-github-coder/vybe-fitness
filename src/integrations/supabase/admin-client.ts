import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const adminStorageKey = "vybe-admin-auth";

function createAdminFetch(publishableKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (headers.get("Authorization") === `Bearer ${publishableKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", publishableKey);
    return fetch(input, { ...init, headers });
  };
}

function createAdminClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const publishableKey =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) throw new Error("Backend authentication is not configured.");

  return createClient<Database>(url, publishableKey, {
    global: { fetch: createAdminFetch(publishableKey) },
    auth: {
      storageKey: adminStorageKey,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

let client: ReturnType<typeof createAdminClient> | undefined;

export const adminSupabase = new Proxy({} as ReturnType<typeof createAdminClient>, {
  get(_, prop, receiver) {
    if (!client) client = createAdminClient();
    return Reflect.get(client, prop, receiver);
  },
});
