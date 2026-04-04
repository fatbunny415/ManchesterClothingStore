import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SellerState {
  /** Whether the sidebar is collapsed (icon-only mode) */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSellerStore = create<SellerState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'manchester-seller',
    }
  )
);
