import { useState, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import PromptInput from "@/components/PromptInput";
import CodeViewer, { type GeneratedFile } from "@/components/CodeViewer";
import ArchitectureView from "@/components/ArchitectureView";
import GenerationProgress from "@/components/GenerationProgress";
import { generateApp, downloadAsZip, type GenerationResult } from "@/lib/generateApp";
import { toast } from "sonner";

const GENERATION_STEPS = [
  "Analyzing requirements",
  "Designing architecture",
  "Generating frontend code",
  "Generating backend code",
  "Creating database schema",
  "Setting up authentication",
  "Generating deployment config",
];

type StepStatus = "pending" | "active" | "done";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [steps, setSteps] = useState<{ label: string; status: StepStatus }[]>([]);

  const simulateProgress = useCallback(() => {
    const stepsState = GENERATION_STEPS.map((label) => ({ label, status: "pending" as StepStatus }));
    setSteps(stepsState);

    let current = 0;
    const interval = setInterval(() => {
      setSteps((prev) => {
        const next = [...prev];
        if (current > 0 && current <= next.length) {
          next[current - 1] = { ...next[current - 1], status: "done" };
        }
        if (current < next.length) {
          next[current] = { ...next[current], status: "active" };
        }
        return next;
      });
      current++;
      if (current > GENERATION_STEPS.length) clearInterval(interval);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setResult(null);
    const cleanup = simulateProgress();

    try {
      const data = await generateApp(prompt);
      setResult(data);
      // Mark all steps done
      setSteps((prev) => prev.map((s) => ({ ...s, status: "done" as StepStatus })));
      toast.success("Application generated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      toast.error(message);
    } finally {
      cleanup();
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.files) {
      downloadAsZip(result.files);
      toast.success("Download started!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />

      {isLoading && <GenerationProgress steps={steps} />}

      {result && (
        <>
          <ArchitectureView architecture={result.architecture} />
          <CodeViewer files={result.files} onDownload={handleDownload} />
        </>
      )}

      <div className="h-20" />
    </div>
  );
};

export default Index;
