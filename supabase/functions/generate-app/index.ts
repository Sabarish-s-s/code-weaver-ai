import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are AutoDev AI Agent, a full-stack application code generator. When given a user's app description, you generate a complete project with:

1. React frontend with Tailwind CSS
2. FastAPI backend with proper routing
3. PostgreSQL database schema using SQLAlchemy
4. JWT authentication (login/signup)
5. Docker deployment configuration

IMPORTANT: Return ONLY valid JSON (no markdown, no code fences). Use the exact structure below:

{
  "architecture": {
    "overview": "Brief architecture description",
    "components": [
      {"name": "Frontend", "description": "..."},
      {"name": "Backend", "description": "..."},
      {"name": "Database", "description": "..."},
      {"name": "Authentication", "description": "..."},
      {"name": "Deployment", "description": "..."}
    ],
    "apiEndpoints": ["POST /api/auth/login", "POST /api/auth/signup", ...]
  },
  "files": [
    {
      "path": "frontend/src/App.tsx",
      "content": "actual code here",
      "language": "tsx"
    },
    {
      "path": "frontend/src/pages/Login.tsx",
      "content": "actual code here",
      "language": "tsx"
    },
    {
      "path": "backend/main.py",
      "content": "actual code here",
      "language": "python"
    },
    {
      "path": "backend/models.py",
      "content": "actual code here",
      "language": "python"
    },
    {
      "path": "backend/auth.py",
      "content": "actual code here",
      "language": "python"
    },
    {
      "path": "backend/routes/",
      "content": "actual code here",
      "language": "python"
    },
    {
      "path": "backend/database.py",
      "content": "actual code here",
      "language": "python"
    },
    {
      "path": "docker/Dockerfile.frontend",
      "content": "actual code here",
      "language": "dockerfile"
    },
    {
      "path": "docker/Dockerfile.backend",
      "content": "actual code here",
      "language": "dockerfile"
    },
    {
      "path": "docker-compose.yml",
      "content": "actual code here",
      "language": "yaml"
    },
    {
      "path": "README.md",
      "content": "setup instructions",
      "language": "markdown"
    }
  ]
}

Generate REAL, WORKING code — not pseudocode. Include proper imports, error handling, and comments. Make the code production-ready and modular.`;

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
          { role: "user", content: `Generate a complete full-stack application for: ${prompt}` },
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

    // Try to parse the JSON from the AI response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("Failed to parse generated code");
    }

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
