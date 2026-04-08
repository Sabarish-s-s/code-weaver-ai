import { Database, Globe, Server, Shield, Container } from "lucide-react";

interface ArchitectureViewProps {
  architecture: {
    overview: string;
    components: { name: string; description: string }[];
    apiEndpoints: string[];
  } | null;
}

const ICONS: Record<string, React.ElementType> = {
  Frontend: Globe,
  Backend: Server,
  Database: Database,
  Authentication: Shield,
  Deployment: Container,
};

const ArchitectureView = ({ architecture }: ArchitectureViewProps) => {
  if (!architecture) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-10">
      <h2 className="text-xl font-semibold text-foreground mb-4">System Architecture</h2>

      <p className="text-muted-foreground mb-6">{architecture.overview}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {architecture.components.map((comp) => {
          const Icon = ICONS[comp.name] || Server;
          return (
            <div key={comp.name} className="glass rounded-lg p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">{comp.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{comp.description}</p>
            </div>
          );
        })}
      </div>

      {architecture.apiEndpoints.length > 0 && (
        <div className="glass rounded-lg p-5">
          <h3 className="font-medium text-foreground mb-3">API Endpoints</h3>
          <div className="space-y-1">
            {architecture.apiEndpoints.map((ep, i) => (
              <div key={i} className="text-sm font-mono text-muted-foreground py-1 px-3 rounded bg-secondary/50">
                {ep}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureView;
