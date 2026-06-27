'use client';
import { FileText, Layers } from 'lucide-react';
import { useMobilePanels } from './MobilePanelsContext';

export function MobilePanelBar() {
  const ctx = useMobilePanels();
  if (!ctx || (!ctx.hasSources && !ctx.hasStudio)) return null;

  const { openPanel, togglePanel, hasSources, hasStudio } = ctx;

  return (
    <div className="md:hidden shrink-0 px-3 py-2 flex items-center gap-2 border-b border-bg-border bg-bg-base">
      {hasSources && (
        <button
          type="button"
          onClick={() => togglePanel('sources')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
            openPanel === 'sources'
              ? 'bg-secondary-muted border-secondary/40 text-secondary'
              : 'bg-bg-surface border-bg-border text-ink-muted'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Sources
        </button>
      )}
      {hasStudio && (
        <button
          type="button"
          onClick={() => togglePanel('studio')}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
            openPanel === 'studio'
              ? 'bg-secondary-muted border-secondary/40 text-secondary'
              : 'bg-bg-surface border-bg-border text-ink-muted'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Studio
        </button>
      )}
    </div>
  );
}
