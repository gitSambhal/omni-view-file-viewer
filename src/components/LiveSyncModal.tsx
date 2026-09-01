/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { RefreshCw, X, HardDrive, Clock, CheckCircle2, AlertCircle, Play, Pause, FileText, Info } from 'lucide-react';
import { TabFile } from '../types/file';
import { formatFileSize } from '../services/fileDetector';

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
  if (!isOpen) return null;

  const liveTabs = tabs.filter(t => t.liveSyncActive);
  const totalReloads = tabs.reduce((acc, t) => acc + (t.syncCount || 0), 0);
  const isNativeSupported = 'showOpenFilePicker' in window;

  const formatTimestamp = (ts?: number) => {
    if (!ts) return 'Not yet synced';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Live Sync Dashboard & Metadata
                {isSyncing && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                    Syncing Changes...
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time disk monitoring and sync metadata telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Active Monitored</span>
                <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {liveTabs.length} / {tabs.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Files watched</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Polling Frequency</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                1.5s
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">1500 ms interval</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Total Reloads</span>
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                {totalReloads}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Auto-updates triggered</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Disk API Access</span>
                {isNativeSupported ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {isNativeSupported ? 'Native File System' : 'Standard File API'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isNativeSupported ? 'Direct Handle Monitoring' : 'Fallback Mode'}
              </div>
            </div>
          </div>

          {/* Monitored Files Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              File Sync Telemetry Metadata
            </h3>

            {tabs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                No active tabs open in workspace.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">File Name</th>
                        <th className="p-3">Sync Status</th>
                        <th className="p-3">Disk Handle</th>
                        <th className="p-3">Last Synced</th>
                        <th className="p-3">Reloads</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-mono">
                      {tabs.map(tab => (
                        <tr
                          key={tab.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                                {tab.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatFileSize(tab.size)}
                            </div>
                          </td>

                          <td className="p-3">
                            {tab.liveSyncActive ? (
                              tab.syncStatus === 'syncing' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 animate-pulse">
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  Syncing
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Watching
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
                                Disabled
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                            {tab.fileHandle ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Native Handle</span>
                            ) : (
                              <span className="text-slate-400">Memory Sync</span>
                            )}
                          </td>

                          <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px]">
                            {formatTimestamp(tab.lastSyncedAt)}
                          </td>

                          <td className="p-3 text-slate-800 dark:text-slate-200 font-bold">
                            {tab.syncCount || 0}
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => onToggleLiveSyncTab(tab.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer flex items-center gap-1 ml-auto ${
                                tab.liveSyncActive
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                              }`}
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
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Educational Note */}
          <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">How Live Sync Works</p>
              <p className="leading-relaxed">
                When files are linked with native File Access API permissions, OmniView monitors disk timestamps every 1.5 seconds. Any edits made in external editors (VS Code, Excel, Photoshop, Word) automatically update the preview instantly without requiring page refreshes.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-lg text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
