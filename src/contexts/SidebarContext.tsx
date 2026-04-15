import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SidebarContextType {
  isDesktopSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  toggleDesktopSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'admin-sidebar-state';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize from local storage, default to true if not set
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return true;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isDesktopSidebarOpen));
  }, [isDesktopSidebarOpen]);

  const toggleDesktopSidebar = () => setIsDesktopSidebarOpen((prev: boolean) => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev: boolean) => !prev);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isDesktopSidebarOpen,
        isMobileSidebarOpen,
        toggleDesktopSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
