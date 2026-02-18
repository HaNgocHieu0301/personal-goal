"use client";

import { useGoalStore } from "@/stores/goal-store";
import { GoalNodeItem } from "@/components/goal-node";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function GoalTree() {
    const { goals, addGoal } = useGoalStore();

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Focus Goals</h2>
                <Button variant="outline" size="sm" onClick={() => addGoal(null, "New Top-Level Goal")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                </Button>
            </div>

            <div className="space-y-1">
                {goals.map((goal) => (
                    <GoalNodeItem key={goal.id} node={goal} />
                ))}
            </div>

            {goals.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    No goals yet. Start by adding one above.
                </div>
            )}
        </div>
    );
}
