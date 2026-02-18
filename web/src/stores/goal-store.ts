import { create } from "zustand";
import { INITIAL_GOALS, INITIAL_METRICS } from "@/lib/mock-data";
import { GoalNode, UserMetrics } from "@/types";

interface GoalState {
    goals: GoalNode[];
    metrics: UserMetrics;
    toggleExpand: (id: string) => void;
    updateStatus: (id: string, status: GoalNode["status"]) => void;
    deleteGoal: (id: string) => void;
    addGoal: (parentId: string | null, title: string) => void;
    toggleFocus: (id: string) => void;
}

// Helper to recursively update a node
const updateNodeById = (
    nodes: GoalNode[],
    id: string,
    updateFn: (node: GoalNode) => GoalNode
): GoalNode[] => {
    return nodes.map((node) => {
        if (node.id === id) {
            return updateFn(node);
        }
        if (node.children.length > 0) {
            return { ...node, children: updateNodeById(node.children, id, updateFn) };
        }
        return node;
    });
};

// Helper to delete a node
const deleteNodeById = (nodes: GoalNode[], id: string): GoalNode[] => {
    return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
            ...node,
            children: deleteNodeById(node.children, id),
        }));
};

// Helper to find and add child
const addChildToNode = (
    nodes: GoalNode[],
    parentId: string,
    newGoal: GoalNode
): GoalNode[] => {
    return nodes.map((node) => {
        if (node.id === parentId) {
            return {
                ...node,
                children: [...node.children, newGoal],
                isExpanded: true, // Auto expand parent
            };
        }
        if (node.children.length > 0) {
            return {
                ...node,
                children: addChildToNode(node.children, parentId, newGoal),
            };
        }
        return node;
    });
};

export const useGoalStore = create<GoalState>((set) => ({
    goals: INITIAL_GOALS,
    metrics: INITIAL_METRICS,

    toggleExpand: (id: string) =>
        set((state) => ({
            goals: updateNodeById(state.goals, id, (node) => ({
                ...node,
                isExpanded: !node.isExpanded,
            })),
        })),

    updateStatus: (id: string, status: GoalNode["status"]) =>
        set((state) => ({
            goals: updateNodeById(state.goals, id, (node) => ({ ...node, status })),
        })),

    deleteGoal: (id: string) =>
        set((state) => ({
            goals: deleteNodeById(state.goals, id),
        })),

    addGoal: (parentId: string | null, title: string) =>
        set((state) => {
            const newGoal: GoalNode = {
                id: crypto.randomUUID(),
                title,
                status: "todo",
                progress: 0,
                weight: 10,
                children: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                isExpanded: true,
                parentId,
            };

            if (!parentId) {
                return { goals: [...state.goals, newGoal] };
            }

            return {
                goals: addChildToNode(state.goals, parentId, newGoal),
            };
        }),
    toggleFocus: (id) =>
        set((state) => ({
            goals: updateNodeById(state.goals, id, (node) => ({
                ...node,
                isFocus: !node.isFocus,
            })),
        })),
}));
