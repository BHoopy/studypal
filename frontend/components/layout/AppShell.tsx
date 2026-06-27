'use client';
import { ReactNode } from 'react';
import { LeftNav } from './LeftNav';
import { MobileBottomNav } from './MobileBottomNav';
import { MobilePanelBar } from './MobilePanelBar';
import { MobilePanelsProvider } from './MobilePanelsContext';

interface AppShellProps {
  children: ReactNode;
  sources?: ReactNode;
  studio?: ReactNode;
  header?: ReactNode;
}

export function AppShell({ children, sources, studio, header }: AppShellProps) {
  return (
    <MobilePanelsProvider hasSources={!!sources} hasStudio={!!studio}>
      <div className="h-dvh bg-bg-base flex overflow-hidden">
        <LeftNav />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {header}
          <MobilePanelBar />
          <div className="flex-1 flex min-h-0 overflow-hidden p-1.5 md:pr-2 md:pb-2 md:pl-2">
            {sources}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-surface border border-bg-border rounded-xl md:rounded-2xl">
              {children}
            </main>
            {studio}
          </div>
        </div>

        <MobileBottomNav />
      </div>
    </MobilePanelsProvider>
  );
}
