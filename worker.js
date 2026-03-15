// Cloudflare Worker - CORS Proxy for Oura API
// Deploy this at workers.cloudflare.com (free tier: 100k requests/day)
//
// Usage: https://your-worker.your-subdomain.workers.dev?url=https://api.ouraring.com/v2/usercollection/daily_sleep
// Pass Authorization header as normal - it gets forwarded to the Oura API.

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Oura CORS Proxy. Usage: ?url=https://api.ouraring.com/...", {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Only allow proxying to Oura API
    if (!target.startsWith("https://api.ouraring.com/")) {
      return new Response("Only api.ouraring.com is allowed", {
        status: 403,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const headers = new Headers();
    if (request.headers.get("Authorization")) {
      headers.set("Authorization", request.headers.get("Authorization"));
    }

    try {
      const resp = await fetch(target, { headers });
      const body = await resp.text();

      return new Response(body, {
        status: resp.status,
        headers: {
          "Content-Type": resp.headers.get("Content-Type") || "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
