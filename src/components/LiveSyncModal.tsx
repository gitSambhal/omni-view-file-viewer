/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView Live Sync Dashboard & Telemetry (shadcn/ui + Radix UI)
 */

import React from 'react';
import { RefreshCw, HardDrive, Clock, CheckCircle2, AlertCircle, Play, Pause, FileText, Info } from 'lucide-react';
import { TabFile } from '../types/file';
import { formatFileSize } from '../services/fileDetector';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from './ui/table';
import { ScrollArea } from './ui/scroll-area';

interface LiveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: TabFile[];
  onToggleLiveSyncTab: (id: string) => void;
  isSyncing: boolean;
}

export const LiveSyncModal: React.FC<LiveSyncModalProps> = ({
  isOpen,
  onClose,
  tabs,
  onToggleLiveSyncTab,
  isSyncing
}) => {
  const liveTabs = tabs.filter(t => t.liveSyncActive);
  const totalReloads = tabs.reduce((acc, t) => acc + (t.syncCount || 0), 0);
  const isNativeSupported = 'showOpenFilePicker' in window;

  const formatTimestamp = (ts?: number) => {
    if (!ts) return 'Not yet synced';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-border bg-muted/40 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold">Live Sync Dashboard & Telemetry</DialogTitle>
                {isSyncing && (
                  <Badge variant="secondary" className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 animate-pulse">
                    Syncing Changes...
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs mt-0.5">
                Real-time disk monitoring and sync metadata telemetry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[65vh] p-5 space-y-5 text-xs">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 bg-muted/30 border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Active Monitored</span>
                <HardDrive className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">
                {liveTabs.length} / {tabs.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Files watched</div>
            </Card>

            <Card className="p-3 bg-muted/30 border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Polling Frequency</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-foreground font-mono">
                1.5s
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">1500 ms interval</div>
            </Card>

            <Card className="p-3 bg-muted/30 border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Total Reloads</span>
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-foreground font-mono">
                {totalReloads}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Auto-updates triggered</div>
            </Card>

            <Card className="p-3 bg-muted/30 border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Disk API Access</span>
                {isNativeSupported ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              <div className="text-xs font-bold text-foreground truncate">
                {isNativeSupported ? 'Native File System' : 'Standard File API'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isNativeSupported ? 'Direct Handle Monitoring' : 'Fallback Mode'}
              </div>
            </Card>
          </div>

          {/* Monitored Files Table */}
          <div className="mt-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              File Sync Telemetry Metadata
            </h3>

            {tabs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No active tabs open in workspace.
              </div>
            ) : (
              <Card className="overflow-hidden border border-border p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Sync Status</TableHead>
                      <TableHead>Disk Handle</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead>Reloads</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tabs.map(tab => (
                      <TableRow key={tab.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground truncate max-w-[160px]">
                              {tab.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {formatFileSize(tab.size)}
                          </div>
                        </TableCell>

                        <TableCell>
                          {tab.liveSyncActive ? (
                            tab.syncStatus === 'syncing' ? (
                              <Badge variant="secondary" className="gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400 animate-pulse">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Syncing
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Watching
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                              Disabled
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {tab.fileHandle ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Native Handle</span>
                          ) : (
                            <span>Memory Sync</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {formatTimestamp(tab.lastSyncedAt)}
                        </TableCell>

                        <TableCell className="text-xs font-mono font-bold text-foreground">
                          {tab.syncCount || 0}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant={tab.liveSyncActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => onToggleLiveSyncTab(tab.id)}
                            className="h-7 text-xs gap-1 ml-auto"
                          >
                            {tab.liveSyncActive ? (
                              <>
                                <Pause className="w-3 h-3" /> Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3" /> Enable
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>

          {/* Educational Note */}
          <Card className="bg-primary/5 border-primary/20 p-3.5 flex items-start gap-3 mt-4">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">How Live Sync Works</p>
              <p className="leading-relaxed">
                When files are linked with native File Access API permissions, OmniView monitors disk timestamps every 1.5 seconds. Any edits made in external editors (VS Code, Excel, Photoshop, Word) automatically update the preview instantly without requiring page refreshes.
              </p>
            </div>
          </Card>
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-muted/40 flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Close Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
