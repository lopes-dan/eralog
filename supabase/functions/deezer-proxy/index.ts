
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const q = url.searchParams.get("q");

    if (!type || !q) {
      return new Response(JSON.stringify({ error: "Missing type or q param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typeMap: Record<string, string> = {
      artist: "artist",
      album: "album",
      track: "track",
      song: "track",
    };

    const deezerType = typeMap[type];
    if (!deezerType) {
      return new Response(
        JSON.stringify({ error: "type must be artist, album, track, or song" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deezerUrl = `https://api.deezer.com/search/${deezerType}?q=${encodeURIComponent(q)}`;
    const res = await fetch(deezerUrl);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Deezer request failed", status: res.status }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


// import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
// };

// Deno.serve(async (req: Request) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, { status: 200, headers: corsHeaders });
//   }

//   try {
//     const url = new URL(req.url);
//     const type = url.searchParams.get("type");
//     const q = url.searchParams.get("q");

//     if (!type || !q) {
//       return new Response(JSON.stringify({ error: "Missing type or q param" }), {
//         status: 400,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     if (type !== "artist" && type !== "album") {
//       return new Response(JSON.stringify({ error: "type must be artist or album" }), {
//         status: 400,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const deezerUrl = `https://api.deezer.com/search/${type}?q=${encodeURIComponent(q)}`;
//     const res = await fetch(deezerUrl);

//     if (!res.ok) {
//       return new Response(JSON.stringify({ error: "Deezer request failed", status: res.status }), {
//         status: res.status,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const data = await res.json();

//     return new Response(JSON.stringify(data), {
//       status: 200,
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     return new Response(JSON.stringify({ error: String(err) }), {
//       status: 500,
//       headers: { ...corsHeaders, "Content-Type": "application/json" },
//     });
//   }
// });
