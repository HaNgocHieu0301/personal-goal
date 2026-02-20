import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GoalNode } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
    baseURL: API_URL,
});

const sortNodes = (a: GoalNode, b: GoalNode) => {
    // 1. "done" status goes to the bottom
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;

    // 2. Fallback: sort by creation date ascending (oldest first)
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateA - dateB;
};

// Helper to build tree from flat list
const buildTree = (nodes: GoalNode[]): any[] => {
    const map = new Map<string, any>();
    const sortedNodes = [...nodes].sort(sortNodes);

    sortedNodes.forEach((node) => map.set(node.id, { ...node, children: [] }));

    const tree: any[] = [];
    sortedNodes.forEach((node) => {
        if (node.parentId && map.has(node.parentId)) {
            map.get(node.parentId).children.push(map.get(node.id));
        } else {
            tree.push(map.get(node.id));
        }
    });

    return tree;
};

export function useGoals() {
    return useQuery({
        queryKey: ["goals"],
        queryFn: async () => {
            const { data } = await api.get<GoalNode[]>("/goals");
            return buildTree(data);
        },
    });
}

export function useCreateGoal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newGoal: Partial<GoalNode>) => {
            const { data } = await api.post("/goals", newGoal);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });
}

export function useUpdateGoal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (goal: GoalNode) => {
            const { data } = await api.put(`/goals/${goal.id}`, goal);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });
}

export function useDeleteGoal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/goals/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });
}

export function useToggleFocus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.patch(`/goals/${id}/focus`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
        },
    });
}
