/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Supported Code Runners & In-Browser Execution Guide (shadcn/ui + Radix UI)
 */

import React, { useState } from 'react';
import {
  Play,
  Terminal,
  Database,
  Code2,
  Globe,
  ShieldCheck,
  Check,
  Copy,
  Sparkles
} from 'lucide-react';
import { RUNNERS_REGISTRY, SupportedRunner } from '../services/codeRunners';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

export interface CodeRunnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleSnippet?: (code: string, filename: string, language: string) => void;
}

const RUNNER_SAMPLES: Record<SupportedRunner, { title: string; filename: string; language: string; code: string }> = {
  javascript: {
    title: 'JavaScript Data Processing',
    filename: 'analytics.js',
    language: 'javascript',
    code: `// Modern ES2024 Array Processing & Console Table
const users = [
  { id: 1, name: "Alice Smith", role: "Admin", score: 98.4 },
  { id: 2, name: "Bob Jones", role: "Editor", score: 87.1 },
  { id: 3, name: "Charlie Day", role: "Viewer", score: 92.5 }
];

console.log("Processing user dataset...");
console.table(users);

// Compute aggregate average
const avgScore = users.reduce((acc, u) => acc + u.score, 0) / users.length;
console.info("Average Score:", avgScore.toFixed(2));

({ totalUsers: users.length, averageScore: avgScore });`
  },
  typescript: {
    title: 'TypeScript Type-Safe Flow',
    filename: 'metrics.ts',
    language: 'typescript',
    code: `// TypeScript execution with in-memory type stripping
interface PerformanceMetric {
  name: string;
  durationMs: number;
  tags: string[];
}

const metrics: PerformanceMetric[] = [
  { name: "file_read", durationMs: 14.2, tags: ["io", "disk"] },
  { name: "token_parse", durationMs: 6.8, tags: ["cpu", "ast"] },
  { name: "render_view", durationMs: 22.1, tags: ["dom", "gpu"] }
];

console.table(metrics);
const slowest = metrics.reduce((prev, curr) => (curr.durationMs > prev.durationMs ? curr : prev));
console.warn("Bottleneck identified:", slowest.name, \`(\${slowest.durationMs}ms)\`);`
  },
  python: {
    title: 'Python 3.12 (Pyodide Wasm)',
    filename: 'statistics_demo.py',
    language: 'python',
    code: `# Python In-Browser Execution via Pyodide 3.12 Wasm
import math

def calculate_stats(numbers):
    total = sum(numbers)
    count = len(numbers)
    mean = total / count
    variance = sum((x - mean) ** 2 for x in numbers) / count
    return {"count": count, "mean": round(mean, 2), "std_dev": round(math.sqrt(variance), 2)}

scores = [88, 92, 79, 95, 84, 90, 76, 98]
print(f"Analyzing {len(scores)} student exam scores...")
stats = calculate_stats(scores)

for key, val in stats.items():
    print(f"  • {key.upper()}: {val}")`
  },
  sql: {
    title: 'SQL Relational Database (AlaSQL)',
    filename: 'inventory.sql',
    language: 'sql',
    code: `-- Relational In-Memory Database Query
CREATE TABLE Products (
  id INT,
  name STRING,
  category STRING,
  price FLOAT,
  stock INT
);

INSERT INTO Products VALUES
  (1, 'Mechanical Keyboard', 'Hardware', 129.99, 45),
  (2, '4K UltraWide Monitor', 'Displays', 499.00, 18),
  (3, 'Wireless Mouse', 'Hardware', 49.50, 120);

SELECT category, COUNT(*) AS items, ROUND(AVG(price), 2) AS avg_price FROM Products GROUP BY category;`
  },
  bash: {
    title: 'Shell / Bash Pipeline',
    filename: 'pipeline.sh',
    language: 'bash',
    code: `# Unix Shell Pipeline Execution in Sandbox
echo "=== Environment Diagnostics ==="
export APP_NAME="OmniView File Studio"
echo "Application: $APP_NAME"

echo "lemon\\napple\\nbanana\\ncherry" | sort | head -n 3`
  },
  json: {
    title: 'JSON Data Workspace',
    filename: 'manifest.json',
    language: 'json',
    code: `{
  "workspace": "OmniView File Studio",
  "version": "2.6.0",
  "features": ["100% Offline", "Code Runners", "Live Disk Sync"],
  "engine": "In-Browser Execution"
}`
  },
  regex: {
    title: 'Regex Pattern Matcher',
    filename: 'log_parser.txt',
    language: 'plaintext',
    code: `// Regex Tester Pattern: /([A-Z]+)\\s+\\[(\\d{4}-\\d{2}-\\d{2})\\]\\s+(.*)/gi
INFO [2026-09-04] Application initialized in 12ms
WARN [2026-09-04] High memory threshold detected: 82%
ERROR [2026-09-04] Connection port 3001 busy`
  },
  brainfuck: {
    title: 'Brainfuck Turing Sandbox',
    filename: 'hello_world.bf',
    language: 'plaintext',
    code: `++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.`
  }
};

export const CodeRunnersModal: React.FC<CodeRunnersModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleSnippet
}) => {
  const [selectedRunner, setSelectedRunner] = useState<SupportedRunner>('python');
  const [copied, setCopied] = useState<boolean>(false);

  const currentSample = RUNNER_SAMPLES[selectedRunner];
  const activeRunnerMeta = RUNNERS_REGISTRY.find(r => r.id === selectedRunner) || RUNNERS_REGISTRY[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">Code Execution Engines</DialogTitle>
                <Badge variant="secondary" className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  100% Client-Side
                </Badge>
              </div>
              <DialogDescription className="text-xs mt-0.5">
                Run scripts locally in browser memory without sending data to any server.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border max-h-[65vh]">
          {/* Left Navigation List */}
          <div className="w-full md:w-60 shrink-0 p-3 space-y-1 bg-muted/20 overflow-y-auto">
            <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground px-2 py-1">
              Select Engine ({RUNNERS_REGISTRY.length})
            </div>
            {RUNNERS_REGISTRY.map(runner => {
              const isSelected = selectedRunner === runner.id;
              return (
                <button
                  key={runner.id}
                  onClick={() => setSelectedRunner(runner.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{runner.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    .{runner.fileExtensions[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Details & Code Area */}
          <ScrollArea className="flex-1 p-5 space-y-4 text-xs">
            {/* Selected Runner Overview Card */}
            <Card className="p-4 bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {activeRunnerMeta.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-mono text-primary">
                    {activeRunnerMeta.engine}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeRunnerMeta.description}
                </p>
              </div>

              {onLoadSampleSnippet && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onLoadSampleSnippet(currentSample.code, currentSample.filename, currentSample.language);
                    onClose();
                  }}
                  className="gap-1.5 text-xs h-8 shrink-0 self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run in Workspace</span>
                </Button>
              )}
            </Card>

            {/* Key Capabilities */}
            <div className="space-y-1.5 mt-4">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground">
                Capabilities
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeRunnerMeta.capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border text-foreground text-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Snippet Preview */}
            <div className="space-y-1.5 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground">
                  Sample Code ({currentSample.filename})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2 text-[11px] gap-1 text-primary"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted/80 text-foreground p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-border max-h-56">
                <pre className="m-0 whitespace-pre leading-relaxed">{currentSample.code}</pre>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px]">Client-Side Sandbox: Zero server dependencies or data transmission.</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
