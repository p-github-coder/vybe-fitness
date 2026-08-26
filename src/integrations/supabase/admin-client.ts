import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const adminStorageKey = "vybe-admin-auth";

function createAdminClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const publishableKey =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) throw new Error("Backend authentication is not configured.");

  return createClient<Database>(url, publishableKey, {
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
