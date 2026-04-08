import { Bot, Sparkles, Zap, Code2 } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative text-center py-16 px-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">AI-Powered App Generator</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          <span className="gradient-text">AutoDev</span>{" "}
          <span className="text-foreground">AI Agent</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe your app in plain English. Get a complete full-stack application 
          with frontend, backend, database, auth, and deployment config — instantly.
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {[
            { icon: Code2, label: "React + FastAPI" },
            { icon: Zap, label: "JWT Auth" },
            { icon: Bot, label: "AI Generated" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
