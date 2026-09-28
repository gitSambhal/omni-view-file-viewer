/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Viewer - Global Application Error Boundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[OmniView Global Error Caught]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            OmniView encountered an unexpected runtime error. Your local files remain safe on your device.
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg p-3.5 mb-6 text-left rounded-lg bg-muted border border-border font-mono text-xs overflow-x-auto text-destructive max-h-40">
              <p className="font-semibold mb-1">{this.state.error.name}: {this.state.error.message}</p>
              {this.state.error.stack && (
                <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap">
                  {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={this.handleReload} className="gap-2 shadow-xs">
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </Button>
            <Button variant="outline" onClick={this.handleReset} className="gap-2">
              <Home className="w-4 h-4" />
              <span>Reset & Clear Cache</span>
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
            <span>OmniView File Viewer • 100% Client-Side</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
