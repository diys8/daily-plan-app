import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);

Deno.serve(async (req) => {
  const headers = {
    "content-type": "application/javascript; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-cache",
  };
  const name = new URL(req.url).searchParams.get("name") || "";
  const { data, error } = await sb.from("asset").select("content").eq("name", name).single();
  if (error || !data) return new Response("// asset not found: " + name, { status: 404, headers });
  return new Response(data.content, { headers });
});
