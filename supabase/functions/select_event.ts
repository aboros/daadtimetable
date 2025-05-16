import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  // Get user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const event_id = body.event_id;
  if (!event_id) {
    return new Response(JSON.stringify({ error: "Missing event_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Insert selection
  const { error } = await supabase.from("user_selections").insert({
    user_id: user.id,
    event_id,
  });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.code === "23505" ? 409 : 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 201 });
}); 