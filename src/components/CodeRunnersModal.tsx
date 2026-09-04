/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Supported Code Runners & In-Browser Execution Guide
 */

import React, { useState } from 'react';
import {
  X,
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

echo "lemon\napple\nbanana\ncherry" | sort | head -n 3`
  },
  json: {
    title: 'JSON Data Workspace',
    filename: 'manifest.json',
    language: 'json',
    code: `{
  "workspace": "OmniView File Studio",
  "version": "2.4.0",
  "features": ["100% Offline", "Code Runners", "Live Disk Sync"],
  "engine": "In-Browser Execution"
}`
  },
  regex: {
    title: 'Regex Pattern Matcher',
    filename: 'log_parser.txt',
    language: 'plaintext',
    code: `// Regex Tester Pattern: /([A-Z]+)\s+\[(\d{4}-\d{2}-\d{2})\]\s+(.*)/gi
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

  if (!isOpen) return null;

  const currentSample = RUNNER_SAMPLES[selectedRunner];
  const activeRunnerMeta = RUNNERS_REGISTRY.find(r => r.id === selectedRunner) || RUNNERS_REGISTRY[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Code Execution Engines</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  100% Client-Side
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Run scripts locally in browser memory without sending data to any server.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-0">
          {/* Left Navigation Tabs */}
          <div className="w-full md:w-60 shrink-0 p-3 space-y-1 bg-slate-50/50 dark:bg-slate-950/40 overflow-y-auto">
            <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 px-2 py-1">
              Select Engine ({RUNNERS_REGISTRY.length})
            </div>
            {RUNNERS_REGISTRY.map(runner => {
              const isSelected = selectedRunner === runner.id;
              return (
                <button
                  key={runner.id}
                  onClick={() => setSelectedRunner(runner.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs">{runner.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    .{runner.fileExtensions[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Main Details & Code Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {/* Selected Runner Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {activeRunnerMeta.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    {activeRunnerMeta.engine}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {activeRunnerMeta.description}
                </p>
              </div>

              {onLoadSampleSnippet && (
                <button
                  onClick={() => {
                    onLoadSampleSnippet(currentSample.code, currentSample.filename, currentSample.language);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 cursor-pointer transition-all self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run in Workspace</span>
                </button>
              )}
            </div>

            {/* Key Capabilities */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400">
                Capabilities
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeRunnerMeta.capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#070b12] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Snippet Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400">
                  Sample Code ({currentSample.filename})
                </span>
                <button
                  onClick={handleCopy}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
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
                </button>
              </div>

              <div className="bg-[#111827] text-slate-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-56">
                <pre className="m-0 whitespace-pre leading-relaxed">{currentSample.code}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Client-Side Sandbox: Zero server dependencies or data transmission.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
