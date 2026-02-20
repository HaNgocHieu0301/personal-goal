"use client";

import { useState } from "react";
import { useGoals, useCreateGoal } from "@/hooks/use-goals";
import { useGoalStore } from "@/stores/goal-store";
import { GoalNodeItem } from "@/components/goal-node";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Circle, CalendarDays, ChevronRight, Star, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths } from "date-fns";
import { YearlyCompass } from "@/components/yearly-compass";

// Generate a list of periods for the sidebar
const generatePeriods = () => {
    const periods: Array<{ value: string; label: string; isYear: boolean; isCurrent: boolean }> = [];
    const now = new Date();

    // Collect all months to show (-2 to +6 relative to now)
    const months: Date[] = [];
    for (let i = -2; i <= 6; i++) {
        const d = i < 0 ? subMonths(now, Math.abs(i)) : addMonths(now, i);
        months.push(d);
    }

    // Group them by unique years
    const uniqueYears = [...new Set(months.map(d => format(d, "yyyy")))];

    uniqueYears.forEach(yearStr => {
        // Add Year Header
        periods.push({
            value: yearStr,
            label: `Year ${yearStr}`,
            isYear: true,
            isCurrent: yearStr === format(now, "yyyy")
        });

        // Add Months belonging to this Year
        const yearMonths = months.filter(d => format(d, "yyyy") === yearStr);
        yearMonths.forEach(d => {
            periods.push({
                value: format(d, "yyyy-MM"),
                label: format(d, "MMMM yyyy"),
                isYear: false,
                isCurrent: d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            });
        });
    });

    return periods;
};

export function GoalTree() {
    const { data: goals, isLoading, error } = useGoals();
    const createGoalMutation = useCreateGoal();
    const [isAddingTopLevel, setIsAddingTopLevel] = useState(false);
    const [topLevelTitle, setTopLevelTitle] = useState("");

    // Timeline Sidebar State (Persisted in GoalStore)
    const periods = generatePeriods();
    const {
        selectedPeriod,
        setSelectedPeriod,
        expandedYears,
        toggleYear
    } = useGoalStore();

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

    // Filter top-level goals by selected period
    const filteredGoalList = goalList.filter(goal => {
        // If it has a targetPeriod, match it. Otherwise, fallback to createdAt
        if (goal.targetPeriod) {
            return goal.targetPeriod === selectedPeriod;
        }
        // Fallback for older data without targetPeriod
        const createdPeriod = format(new Date(goal.createdAt), "yyyy-MM");
        return createdPeriod === selectedPeriod;
    });

    const handleAddTopLevel = () => {
        if (topLevelTitle.trim()) {
            createGoalMutation.mutate({
                title: topLevelTitle,
                parentId: null,
                targetPeriod: selectedPeriod // Attach the selected period
            });
            setTopLevelTitle("");
            setIsAddingTopLevel(false);
        }
    };

    const isYearlyView = selectedPeriod.length === 4;

    return (
        <div className="flex flex-col md:flex-row w-full max-w-7xl xl:max-w-none xl:px-8 mx-auto gap-6 p-4">

            {/* Left Sidebar: Timeline */}
            <div className="w-full md:w-64 shrink-0 space-y-4">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">Timeline</h2>
                </div>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-1">
                        {periods.map((period) => {
                            if (period.isYear) {
                                const isExpanded = expandedYears.has(period.value);
                                return (
                                    <div
                                        key={period.value}
                                        className={cn(
                                            "w-full flex items-center justify-between rounded-md transition-all mb-2 mt-6 first:mt-0 overflow-hidden",
                                            selectedPeriod === period.value
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "bg-muted/40 border border-border hover:bg-muted text-foreground"
                                        )}
                                    >
                                        <button
                                            onClick={() => setSelectedPeriod(period.value)}
                                            className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-left"
                                        >
                                            <Star
                                                className={cn(
                                                    "w-4 h-4 transition-transform shrink-0",
                                                    selectedPeriod === period.value
                                                        ? "fill-primary-foreground/30 text-primary-foreground"
                                                        : "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]",
                                                    !isExpanded && "opacity-80"
                                                )}
                                            />
                                            <span className="truncate">{period.label}</span>
                                        </button>

                                        <button
                                            onClick={() => toggleYear(period.value)}
                                            className="px-3 py-2 shrink-0 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-foreground/10 transition-all rounded-r-md"
                                            title="Toggle months"
                                        >
                                            <ChevronDown className={cn(
                                                "h-4 w-4 transition-transform",
                                                !isExpanded && "-rotate-90"
                                            )} />
                                        </button>
                                    </div>
                                );
                            } else {
                                // Month rendering
                                const belongsToYear = period.value.substring(0, 4);
                                if (!expandedYears.has(belongsToYear)) return null;

                                return (
                                    <button
                                        key={period.value}
                                        onClick={() => setSelectedPeriod(period.value)}
                                        className={cn(
                                            "w-[calc(100%-1rem)] flex items-center justify-between px-3 py-2 text-sm ml-4 rounded-md transition-all animate-in slide-in-from-top-2 fade-in duration-200",
                                            selectedPeriod === period.value
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {period.label}
                                            {period.isCurrent && (
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    selectedPeriod === period.value ? "bg-primary-foreground" : "bg-primary"
                                                )} />
                                            )}
                                        </span>
                                        {selectedPeriod === period.value && <ChevronRight className="h-4 w-4 opacity-50" />}
                                    </button>
                                );
                            }
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Content Area: Goal Tree */}
            <div className="flex-1 space-y-4 border-l pl-0 md:pl-6 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/95 backdrop-blur z-10 pb-4 pt-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Focus Goals</h2>
                        <p className="text-sm text-muted-foreground hidden sm:block">
                            Planning for {periods.find(p => p.value === selectedPeriod)?.label}
                        </p>
                    </div>

                    <Button
                        variant="default"
                        size="sm"
                        disabled={createGoalMutation.isPending}
                        onClick={() => setIsAddingTopLevel(true)}
                        className="shadow-sm"
                    >
                        {createGoalMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        {isYearlyView ? "Add Yearly Goal" : "Add Goal"}
                    </Button>
                </div>

                <div className="space-y-1 pb-20">
                    {/* Add Top Level Input */}
                    {isAddingTopLevel && (
                        <div className="flex items-center gap-2 py-2 px-2 rounded-md bg-muted/50 border border-primary/20 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div className="w-4 h-4" /> {/* Expand spacer */}
                            <div className="p-0.5"><Circle className="h-4 w-4 text-primary" /></div>
                            <Input
                                autoFocus
                                value={topLevelTitle}
                                onChange={(e) => setTopLevelTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleAddTopLevel();
                                    if (e.key === "Escape") setIsAddingTopLevel(false);
                                }}
                                onBlur={handleAddTopLevel}
                                className="h-8 text-sm flex-1 bg-background border-none shadow-none focus-visible:ring-1"
                                placeholder={`New goal for ${periods.find(p => p.value === selectedPeriod)?.label}...`}
                            />
                        </div>
                    )}

                    {/* Render different views depending on the length of the string */}
                    {isYearlyView ? (
                        <>
                            <YearlyCompass goals={goals || []} year={selectedPeriod} />

                        </>
                    ) : (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            {filteredGoalList.map((goal) => (
                                <GoalNodeItem key={goal.id} node={goal} />
                            ))}

                            {filteredGoalList.length === 0 && !isAddingTopLevel && (
                                <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/10">
                                    <CalendarDays className="h-10 w-10 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No goals found for this period</p>
                                    <p className="text-sm opacity-70 mt-1">Start by adding a new goal above to plan your month.</p>
                                    <Button
                                        variant="outline"
                                        className="mt-6"
                                        onClick={() => setIsAddingTopLevel(true)}
                                    >
                                        Create First Goal
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
