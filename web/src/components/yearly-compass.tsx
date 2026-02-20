"use client";

import { GoalNode } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Layers, ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface YearlyCompassProps {
    goals: GoalNode[];
    year: string;
}

export function YearlyCompass({ goals, year }: YearlyCompassProps) {
    // Filter only top-level goals that belong to this year
    const yearlyGoals = goals.filter(goal => goal.targetPeriod === year && !goal.parentId);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

    const activeGoal = yearlyGoals.find(g => g.id === selectedGoalId);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {yearlyGoals.map(goal => {
                    // logic for progress:
                    // 0. If status is done, 100%
                    // 1. If has targetSessions, use sessions
                    // 2. If has children, use children completion
                    // 3. Fallback to manual goal.progress
                    let displayProgress = goal.progress;
                    const hasSessions = goal.targetSessions && goal.targetSessions > 0;
                    const totalChildren = goal.children?.length || 0;
                    const completedChildren = goal.children?.filter(c => c.status === "done").length || 0;

                    if (goal.status === 'done') {
                        displayProgress = 100;
                    } else if (hasSessions) {
                        displayProgress = Math.round(((goal.completedSessions || 0) / (goal.targetSessions || 1)) * 100);
                    } else if (totalChildren > 0) {
                        displayProgress = Math.round((completedChildren / totalChildren) * 100);
                    }

                    return (
                        <Card key={goal.id} className="relative overflow-hidden group hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-card to-card/50">
                            {/* Decorative background blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-colors group-hover:bg-primary/10" />

                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Target className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-mono px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                        {displayProgress}%
                                    </span>
                                </div>
                                <CardTitle className="mt-4 text-xl line-clamp-2">{goal.title}</CardTitle>
                                {goal.description && (
                                    <CardDescription className="line-clamp-2 mt-1">
                                        {goal.description}
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                        <span>Progress</span>
                                        <span>
                                            {goal.status === 'done'
                                                ? (hasSessions ? `${goal.targetSessions}/${goal.targetSessions}` : "Completed! 🎉")
                                                : (hasSessions ? `${goal.completedSessions || 0}/${goal.targetSessions}` : "On Track")}
                                        </span>
                                    </div>
                                    <Progress value={displayProgress} className="h-2" />
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                    <div className="flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>{totalChildren} Linked Tasks</span>
                                    </div>
                                    {completedChildren > 0 && (
                                        <span className="text-green-500 font-medium">
                                            {completedChildren} Done
                                        </span>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-0">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between"
                                    size="sm"
                                    onClick={() => setSelectedGoalId(goal.id)}
                                >
                                    View Breakdown
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}

                {yearlyGoals.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
                        <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-bold">No Yearly Goals Set</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            Define your high-level objectives for {year}. These will act as your north star for the coming months.
                        </p>
                    </div>
                )}
            </div>

            {/* Breakdown Dialog */}
            <Dialog open={!!selectedGoalId} onOpenChange={(open) => !open && setSelectedGoalId(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{activeGoal?.title}</DialogTitle>
                        <DialogDescription>
                            Detailed breakdown of all tasks linked to this yearly goal.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[50vh] mt-4 pr-4">
                        <div className="space-y-3">
                            {activeGoal?.children && activeGoal.children.length > 0 ? (
                                activeGoal.children.map(child => (
                                    <div key={child.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground">
                                        {child.status === 'done' ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                        ) : (
                                            <CircleDashed className="h-5 w-5 text-muted-foreground shrink-0" />
                                        )}
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${child.status === 'done' ? 'line-through opacity-70' : ''}`}>
                                                {child.title}
                                            </span>
                                            {child.targetPeriod && (
                                                <span className="text-xs text-primary/80 font-mono mt-0.5">
                                                    Target: {child.targetPeriod}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No tasks have been linked to this goal yet.</p>
                                    <p className="text-xs mt-1">Go to a specific month and link tasks to populate this view.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}
