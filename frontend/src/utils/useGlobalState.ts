import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalState {
  selectedBranchId?: string;
  selectBranch: (branchId: string) => void;
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      selectBranch: (branchId) => set({ selectedBranchId: branchId }),
    }),
    {
      partialize: (state) => ({ selectedBranchId: state.selectedBranchId }),
      name: "GlobalState",
    },
  ),
);
