import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Parse query parameters
  const url = new URL(req.url);
  const date = url.searchParams.get("date"); // expects YYYY-MM-DD
  const location = url.searchParams.get("location");
  const artist = url.searchParams.get("artist");

  let query = supabase
    .from("events")
    .select("id, summary, description, start_time, end_time, location_id, locations(name)")
    .order("start_time", { ascending: true });

  if (date) {
    // Filter by date (assuming start_time is in ISO format)
    query = query.gte("start_time", `${date}T00:00:00.000Z`).lt("start_time", `${date}T23:59:59.999Z`);
  }
  if (location) {
    query = query.eq("location_id", location);
  }
  if (artist) {
    query = query.ilike("summary", `%${artist}%`);
  }

  const { data, error } = await query;

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  };

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: corsHeaders,
  });
}); 