import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a code generator. Given an app description, return a JSON object with this structure:

{
  "architecture": {
    "overview": "Brief description",
    "components": [{"name": "Frontend", "description": "..."}, {"name": "Backend", "description": "..."}, {"name": "Database", "description": "..."}, {"name": "Auth", "description": "..."}, {"name": "Deployment", "description": "..."}],
    "apiEndpoints": ["POST /api/auth/login", "GET /api/items"]
  },
  "files": [
    {"path": "frontend/src/App.tsx", "content": "code here", "language": "tsx"},
    {"path": "backend/main.py", "content": "code here", "language": "python"},
    {"path": "docker-compose.yml", "content": "code here", "language": "yaml"}
  ]
}

Rules:
- Return ONLY the JSON object, no markdown fences, no explanation
- Keep the app SIMPLE - a minimal viable version with 3-6 files max
- Use React+Tailwind for frontend, FastAPI for backend, SQLAlchemy for DB
- Include JWT auth, Dockerfiles, and docker-compose
- Generate real working code with imports`;

function extractJson(raw: string): unknown {
  let cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  const jsonStart = cleaned.search(/[{[]/);
  if (jsonStart === -1) throw new Error("No JSON found in response");

  const openChar = cleaned[jsonStart];
  const closeChar = openChar === "[" ? "]" : "}";
  const jsonEnd = cleaned.lastIndexOf(closeChar);
  if (jsonEnd === -1) throw new Error("No closing bracket found");

  cleaned = cleaned.substring(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fix common issues
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, (ch) => (ch === "\n" || ch === "\r" || ch === "\t" ? ch : ""));

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Check for truncation
      const openBraces = (cleaned.match(/{/g) || []).length;
      const closeBraces = (cleaned.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        throw new Error("Response was truncated - try a simpler prompt");
      }
      throw new Error("Failed to parse generated code");
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a minimal full-stack app for: ${prompt}\n\nKeep it simple with 3-6 files. Return only the JSON.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    const parsed = extractJson(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-app error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
