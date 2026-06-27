'use client';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type MobilePanel = 'sources' | 'studio';

interface MobilePanelsContextValue {
  openPanel: MobilePanel | null;
  setOpenPanel: (panel: MobilePanel | null) => void;
  togglePanel: (panel: MobilePanel) => void;
  hasSources: boolean;
  hasStudio: boolean;
}

const MobilePanelsContext = createContext<MobilePanelsContextValue | null>(null);

export function MobilePanelsProvider({
  children,
  hasSources,
  hasStudio,
}: {
  children: ReactNode;
  hasSources: boolean;
  hasStudio: boolean;
}) {
  const [openPanel, setOpenPanel] = useState<MobilePanel | null>(null);

  const value = useMemo(
    () => ({
      openPanel,
      setOpenPanel,
      togglePanel: (panel: MobilePanel) =>
        setOpenPanel(prev => (prev === panel ? null : panel)),
      hasSources,
      hasStudio,
    }),
    [openPanel, hasSources, hasStudio],
  );

  return (
    <MobilePanelsContext.Provider value={value}>
      {children}
    </MobilePanelsContext.Provider>
  );
}

export function useMobilePanels() {
  return useContext(MobilePanelsContext);
}
