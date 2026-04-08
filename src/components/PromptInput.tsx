import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2 } from "lucide-react";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  "Build a food delivery app with login, restaurant listings, cart, and Stripe payments",
  "Create a project management tool with teams, tasks, deadlines, and Kanban boards",
  "Build a social media platform with user profiles, posts, likes, comments, and messaging",
];

const PromptInput = ({ onGenerate, isLoading }: PromptInputProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="glass rounded-xl p-1">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the app you want to build..."
          className="min-h-[120px] bg-transparent border-0 text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-0 text-base p-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
        />
        <div className="flex items-center justify-between p-3 pt-0">
          <span className="text-xs text-muted-foreground">
            Ctrl+Enter to generate
          </span>
          <Button
            variant="hero"
            size="lg"
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate App
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground mr-1">Try:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setPrompt(ex)}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border"
          >
            {ex.length > 50 ? ex.slice(0, 50) + "..." : ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptInput;
