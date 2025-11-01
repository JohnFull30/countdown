// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405, headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get current user from auth header (RLS-aware client)
    const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });
    const {
      data: { user },
      error: userErr,
    } = await supabaseAuthClient.auth.getUser();
    if (userErr || !user) {
      return new Response("Unauthorized", { status: 401, headers: cors });
    }

    const { deviceId } = await req.json();
    if (!deviceId) {
      return new Response("Missing deviceId", { status: 400, headers: cors });
    }

    const supabaseService = createClient(supabaseUrl, serviceKey);

    // Link all device-only entitlements to this user
    const { error } = await supabaseService
      .from("entitlements")
      .update({ user_id: user.id })
      .is("user_id", null)
      .eq("device_id", deviceId);

    if (error) {
      console.error("Claim update error:", error);
      return new Response("Failed to claim", { status: 500, headers: cors });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("claim-entitlements error:", err?.message ?? err);
    return new Response("Error", { status: 500, headers: cors });
  }
});
