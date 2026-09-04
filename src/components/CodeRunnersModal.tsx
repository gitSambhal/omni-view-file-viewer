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
  Cpu,
  Database,
  Code,
  Globe,
  FileCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  Layers
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

// Return value test
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
    title: 'Python 3.12 (Math & Algorithms)',
    filename: 'statistics_demo.py',
    language: 'python',
    code: `# Python In-Browser Execution (Pyodide & Local Engine)
import math

def calculate_stats(numbers):
    total = sum(numbers)
    count = len(numbers)
    mean = total / count
    variance = sum((x - mean) ** 2 for x in numbers) / count
    std_dev = math.sqrt(variance)
    return {"count": count, "mean": round(mean, 2), "std_dev": round(std_dev, 2)}

scores = [88, 92, 79, 95, 84, 90, 76, 98]
print(f"Analyzing {len(scores)} student exam scores...")
stats = calculate_stats(scores)

for key, val in stats.items():
    print(f"  • {key.upper()}: {val}")

print("Python execution successfully completed in-browser!")`
  },
  sql: {
    title: 'SQL Relational Queries (AlaSQL)',
    filename: 'inventory.sql',
    language: 'sql',
    code: `-- Relational In-Memory Database Execution
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
  (3, 'Wireless Mouse', 'Hardware', 49.50, 120),
  (4, 'Noise-Cancelling Headphones', 'Audio', 199.95, 34);

-- Query Category Performance
SELECT 
  category, 
  COUNT(*) AS total_items, 
  ROUND(AVG(price), 2) AS avg_price, 
  SUM(stock) AS total_inventory 
FROM Products 
GROUP BY category 
ORDER BY total_inventory DESC;`
  },
  bash: {
    title: 'Shell / Bash Command Pipelines',
    filename: 'build_pipeline.sh',
    language: 'bash',
    code: `# Unix Shell Pipeline Execution in In-Browser Sandbox
echo "=== System Environment Diagnostics ==="
export APP_NAME="OmniView File Studio"
export BUILD_ID="v2.4.0-edge"

echo "Application: $APP_NAME ($BUILD_ID)"
date

# Pipeline chaining test
echo "lemon\napple\nbanana\ncherry\navocado" | sort | grep -v "banana" | head -n 3

echo "Base64 Encoding pipeline:"
echo "Hello from client-side Bash" | base64`
  },
  json: {
    title: 'JSON Data Transformation',
    filename: 'manifest.json',
    language: 'json',
    code: `{
  "workspace": "OmniView File Studio",
  "version": "2.4.0",
  "features": [
    "100% Offline Client-side Processing",
    "Universal Code Runners (JS, TS, Python, SQL, Bash)",
    "Direct URL Streaming with CORS Fallback",
    "Live Disk Sync via File System Access API"
  ],
  "engines": {
    "javascript": "V8 Sandbox",
    "python": "Pyodide CPython 3.12 WebAssembly",
    "sql": "AlaSQL Relational Engine",
    "bash": "Unix Pipeline Simulator"
  }
}`
  },
  regex: {
    title: 'Regex Pattern Matcher',
    filename: 'log_parser.txt',
    language: 'plaintext',
    code: `// Regex Tester Pattern: /([A-Z]+)\s+\[(\d{4}-\d{2}-\d{2})\]\s+(.*)/gi
INFO [2026-09-04] Application initialized in 12ms
WARN [2026-09-04] High memory threshold detected: 82%
ERROR [2026-09-04] Failed to connect to external port 3001
SUCCESS [2026-09-04] Local database synchronizer completed`
  },
  brainfuck: {
    title: 'Brainfuck Turing Machine',
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

  if (!isOpen) return null;

  const currentSample = RUNNER_SAMPLES[selectedRunner];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 dark:text-slate-100 select-text">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>In-Browser Code Runners & Execution Engines</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  100% Client-Side
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute code directly in browser memory without sending data to any external server.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Left Column: Runner Directory List */}
          <div className="w-full md:w-72 shrink-0 p-3 space-y-1.5 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Supported Code Runners ({RUNNERS_REGISTRY.length})
            </div>
            {RUNNERS_REGISTRY.map(runner => {
              const isSelected = selectedRunner === runner.id;
              return (
                <button
                  key={runner.id}
                  onClick={() => setSelectedRunner(runner.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{runner.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                        isSelected ? 'bg-white/20 text-white border-white/30' : runner.badgeColor
                      }`}
                    >
                      {runner.fileExtensions[0].toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {runner.engine}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Runner Details & Code Sample */}
          {(() => {
            const runner = RUNNERS_REGISTRY.find(r => r.id === selectedRunner) || RUNNERS_REGISTRY[0];
            return (
              <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
                {/* Engine Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{runner.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${runner.badgeColor}`}>
                        {runner.engine}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {runner.description}
                    </p>
                  </div>

                  {onLoadSampleSnippet && (
                    <button
                      onClick={() => {
                        onLoadSampleSnippet(currentSample.code, currentSample.filename, currentSample.language);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0 cursor-pointer transition-all self-start sm:self-auto"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Try in Editor</span>
                    </button>
                  )}
                </div>

                {/* Capabilities Grid */}
                <div className="space-y-2">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    Engine Capabilities
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {runner.capabilities.map((cap, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Sample Snippet Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                      Sample Code ({currentSample.filename})
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentSample.code);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </button>
                  </div>

                  <div className="bg-[#1e2227] text-slate-200 p-3.5 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-700 max-h-56">
                    <pre className="m-0 whitespace-pre leading-relaxed">{currentSample.code}</pre>
                  </div>
                </div>

                {/* HTML & Web Preview Note */}
                <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      HTML, CSS & SVG Live Sandbox
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      HTML files (.html, .htm, .svg) can also be toggled into full interactive <strong>Live Preview</strong> with isolated iframe sandbox, console output listeners, and device viewport simulations.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Isolated Sandboxing: Scripts cannot access cookies, parent storage, or unauthorized local files.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
