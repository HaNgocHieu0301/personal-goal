import { create } from "zustand";
import { INITIAL_METRICS } from "@/lib/mock-data";
import { UserMetrics } from "@/types";
import { format } from "date-fns";

interface GoalUiState {
    expandedNodeIds: Set<string>;
    metrics: UserMetrics;
    // Timeline state
    selectedPeriod: string;
    expandedYears: Set<string>;

    toggleExpand: (id: string) => void;
    setExpanded: (id: string, expanded: boolean) => void;

    // Timeline actions
    setSelectedPeriod: (period: string) => void;
    toggleYear: (year: string) => void;
}

export const useGoalStore = create<GoalUiState>((set) => ({
    expandedNodeIds: new Set<string>(),
    metrics: INITIAL_METRICS,

    // Default to current month/year
    selectedPeriod: format(new Date(), "yyyy-MM"),
    expandedYears: new Set<string>([format(new Date(), "yyyy")]),

    toggleExpand: (id: string) =>
        set((state) => {
            const next = new Set(state.expandedNodeIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return { expandedNodeIds: next };
        }),

    setExpanded: (id: string, expanded: boolean) =>
        set((state) => {
            const next = new Set(state.expandedNodeIds);
            if (expanded) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return { expandedNodeIds: next };
        }),

    setSelectedPeriod: (period: string) => set({ selectedPeriod: period }),

    toggleYear: (year: string) =>
        set((state) => {
            const next = new Set(state.expandedYears);
            if (next.has(year)) {
                next.delete(year);
            } else {
                next.add(year);
            }
            return { expandedYears: next };
        }),
}));
