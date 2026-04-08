import { CheckCircle2, Loader2, Circle } from "lucide-react";

interface Step {
  label: string;
  status: "pending" | "active" | "done";
}

interface GenerationProgressProps {
  steps: Step[];
}

const GenerationProgress = ({ steps }: GenerationProgressProps) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 my-10">
      <div className="glass rounded-xl p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">Generating your application...</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {step.status === "done" ? (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              ) : step.status === "active" ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  step.status === "done"
                    ? "text-foreground"
                    : step.status === "active"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerationProgress;
