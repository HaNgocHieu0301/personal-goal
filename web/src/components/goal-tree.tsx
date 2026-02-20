"use client";

import { useState } from "react";
import { useGoals, useCreateGoal } from "@/hooks/use-goals";
import { GoalNodeItem } from "@/components/goal-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Circle } from "lucide-react";

export function GoalTree() {
    const { data: goals, isLoading, error } = useGoals();
    const createGoalMutation = useCreateGoal();
    const [isAddingTopLevel, setIsAddingTopLevel] = useState(false);
    const [topLevelTitle, setTopLevelTitle] = useState("");

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-mono">Loading Architect Deck...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-center text-destructive">
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-sm opacity-80 mt-1">Make sure the Docker containers are running.</p>
            </div>
        );
    }

    const goalList = goals || [];

    const handleAddTopLevel = () => {
        if (topLevelTitle.trim()) {
            createGoalMutation.mutate({ title: topLevelTitle, parentId: null });
            setTopLevelTitle("");
            setIsAddingTopLevel(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Focus Goals</h2>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={createGoalMutation.isPending}
                    onClick={() => setIsAddingTopLevel(true)}
                >
                    {createGoalMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Add Goal
                </Button>
            </div>

            <div className="space-y-1">
                {isAddingTopLevel && (
                    <div className="flex items-center gap-2 py-2 px-2 rounded-md bg-muted/30 mb-2">
                        <div className="w-4 h-4" /> {/* Expand spacer */}
                        <div className="p-0.5"><Circle className="h-4 w-4 text-muted-foreground" /></div>
                        <Input
                            autoFocus
                            value={topLevelTitle}
                            onChange={(e) => setTopLevelTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddTopLevel();
                                if (e.key === "Escape") setIsAddingTopLevel(false);
                            }}
                            onBlur={handleAddTopLevel}
                            className="h-8 text-sm flex-1 bg-background"
                            placeholder="Type goal title and press Enter..."
                        />
                    </div>
                )}
                {goalList.map((goal) => (
                    <GoalNodeItem key={goal.id} node={goal} />
                ))}
            </div>

            {goalList.length === 0 && !isAddingTopLevel && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    No goals yet. Start by adding one above.
                </div>
            )}
        </div>
    );
}
