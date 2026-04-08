import type { GeneratedFile } from "@/components/CodeViewer";

interface Architecture {
  overview: string;
  components: { name: string; description: string }[];
  apiEndpoints: string[];
}

export interface GenerationResult {
  architecture: Architecture;
  files: GeneratedFile[];
}

export async function generateApp(prompt: string): Promise<GenerationResult> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-app`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function downloadAsZip(files: GeneratedFile[]) {
  // Simple ZIP-like download - create individual file downloads
  // For a real ZIP, we'd use JSZip but this gives a clean experience
  const content = files
    .map((f) => `// ===== ${f.path} =====\n\n${f.content}`)
    .join("\n\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "autodev-generated-app.txt";
  a.click();
  URL.revokeObjectURL(url);
}
