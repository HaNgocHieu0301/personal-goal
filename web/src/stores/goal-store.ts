import { create } from "zustand";
import { INITIAL_METRICS } from "@/lib/mock-data";
import { UserMetrics } from "@/types";

interface GoalUiState {
    expandedNodeIds: Set<string>;
    metrics: UserMetrics;
    toggleExpand: (id: string) => void;
    setExpanded: (id: string, expanded: boolean) => void;
}

export const useGoalStore = create<GoalUiState>((set) => ({
    expandedNodeIds: new Set<string>(),
    metrics: INITIAL_METRICS,

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
}));
