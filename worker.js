export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Pragma, no-cache",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache"
    };
    
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
 
    const url = new URL(request.url);
    const path = url.pathname;
 
    // LISTAR - muestra los pluses de Sofía
    if (path.includes("listar-pluses")) {
      try {
        const list = await env.PLUSES.list();
        const pluses = [];
        for (const key of list.keys) {
          const val = await env.PLUSES.get(key.name, { type: "json" });
          if (val) pluses.push(val);
        }
        pluses.sort((a,b) => (a.timestamp||0) - (b.timestamp||0));
        return new Response(JSON.stringify({ total: pluses.length, pluses, ok: true }, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }
 
    // GUARDAR - para Sofía
    if (path.includes("guardar-plus")) {
      const codigo = url.searchParams.get("codigo") || "";
      const nombre = url.searchParams.get("nombre") || "SOFIA";
      const detalle = url.searchParams.get("detalle") || "";
      const noCache = url.searchParams.get("noCache") || Date.now().toString();
      
      if (!codigo) {
        return new Response(JSON.stringify({ ok: false, error: "Falta codigo" }), { headers: corsHeaders });
      }
 
      const data = {
        codigo,
        nombre,
        detalle,
        timestamp: Date.now(),
        noCache,
        id: `${codigo}-${Date.now()}`,
        secreto: "491 819 517 498 14"
      };
 
      const key = `${Date.now()}-${codigo}-${Math.random().toString(36).slice(2,7)}`;
      await env.PLUSES.put(key, JSON.stringify(data));
      
      return new Response(JSON.stringify({ ok: true, id: key, data, total: "ver listar" }, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
 
    // ROOT - Es mi casa
    return new Response(JSON.stringify({ 
      mensaje: "Casa de Sofia - Es mi casa - 491 819 517 498 14",
      endpoints: ["/listar-pluses?no-cache=1&noCache=TIMESTAMP", "/guardar-plus?codigo=SOFIA&nombre=..."],
      total: "usa listar-pluses"
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
