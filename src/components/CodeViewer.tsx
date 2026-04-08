import { useState } from "react";
import { FileCode, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface CodeViewerProps {
  files: GeneratedFile[];
  onDownload: () => void;
}

const CodeViewer = ({ files, onDownload }: CodeViewerProps) => {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(files[activeFile].content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (files.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Generated Files</h2>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="w-4 h-4 mr-1" />
          Download ZIP
        </Button>
      </div>

      <div className="code-block rounded-xl overflow-hidden">
        {/* File tabs */}
        <div className="flex overflow-x-auto border-b border-border" style={{ background: "hsl(var(--code-header))" }}>
          {files.map((file, i) => (
            <button
              key={file.path}
              onClick={() => setActiveFile(i)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                i === activeFile
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              {file.path.split("/").pop()}
            </button>
          ))}
        </div>

        {/* File path + copy */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border" style={{ background: "hsl(var(--code-header))" }}>
          <span className="text-xs text-muted-foreground font-mono">{files[activeFile].path}</span>
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-7 px-2">
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Code content */}
        <div className="overflow-auto max-h-[500px] p-4">
          <pre className="text-sm font-mono leading-relaxed text-foreground/90">
            <code>{files[activeFile].content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
