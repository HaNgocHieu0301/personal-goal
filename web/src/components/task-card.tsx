"use client";

import { GoalNode } from "@/types";
import { FocusTimer } from "./focus-timer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Calendar, Edit2, Clock } from "lucide-react";
import { useUpdateGoal } from "@/hooks/use-goals";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";

interface TaskCardProps {
    task: GoalNode;
}

export function TaskCard({ task }: TaskCardProps) {
    const updateGoalMutation = useUpdateGoal();

    const targetSessions = task.targetSessions || 0;

    const handleComplete = () => {
        updateGoalMutation.mutate({ ...task, status: "done", progress: 100 });
    };

    const handleSessionComplete = () => {
        if (task.status === "done") return;

        const newSessions = (task.completedSessions || 0) + 1;
        const shouldComplete = targetSessions > 0 && newSessions >= targetSessions;

        updateGoalMutation.mutate({
            ...task,
            completedSessions: newSessions,
            ...(shouldComplete ? { status: "done", progress: 100 } : {})
        });
    };

    return (
        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Badge variant={task.status === "in-progress" ? "default" : "secondary"}>
                    {task.status}
                </Badge>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                        Weight: {task.weight}
                    </span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground">
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Auto-Complete Target</h4>
                                <p className="text-sm text-muted-foreground">
                                    Configure auto-completion for this mission. Setting 0 disables it.
                                </p>
                                <TargetSessionsConfig task={task} />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {task.title}
                    </CardTitle>
                    {task.description && (
                        <p className="text-muted-foreground text-sm">
                            {task.description}
                        </p>
                    )}
                    {task.deadline && (
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Due: {format(new Date(task.deadline), "MMMM d, yyyy")}</span>
                        </div>
                    )}
                </div>

                {targetSessions > 0 && (
                    <div className="flex justify-center gap-1.5 mt-2 mb-4">
                        {Array.from({ length: targetSessions }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-colors",
                                    i < (task.completedSessions || 0)
                                        ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                        : "bg-primary/10"
                                )}
                                title={`Session ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                <FocusTimer onSessionComplete={handleSessionComplete} />
            </CardContent>

            <CardFooter className="justify-center gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={handleComplete}
                    disabled={updateGoalMutation.isPending || task.status === "done"}
                    className="w-full hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                >
                    {updateGoalMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    {task.status === "done" ? "Completed" : "Mark Complete"}
                </Button>
            </CardFooter>
        </Card>
    );
}

function TargetSessionsConfig({ task }: { task: GoalNode }) {
    const updateGoalMutation = useUpdateGoal();
    const { focusDuration } = useSettingsStore();

    // Mode can be either 'sessions' or 'hours'
    const [mode, setMode] = useState<'sessions' | 'hours'>('sessions');
    const [inputValue, setInputValue] = useState<string>(
        (task.targetSessions || 0).toString()
    );

    const handleUpdate = (valStr: string, currentMode: 'sessions' | 'hours') => {
        setInputValue(valStr);
        const val = parseFloat(valStr);

        if (isNaN(val) || val < 0) return;

        let sessions = 0;
        if (currentMode === 'hours') {
            // Calculate sessions needed for this hours based on current focus duration settings
            const totalMinutesNeeded = val * 60;
            sessions = Math.ceil(totalMinutesNeeded / focusDuration);
        } else {
            sessions = Math.floor(val);
        }

        updateGoalMutation.mutate({
            ...task,
            targetSessions: sessions
        });
    };

    const parsedVal = parseFloat(inputValue);
    const calculatedSessions = !isNaN(parsedVal) && mode === 'hours'
        ? Math.ceil((parsedVal * 60) / focusDuration)
        : Math.floor(parsedVal || 0);

    return (
        <div className="grid gap-4 pt-2 border-t">
            <div className="flex items-center gap-4">
                <Button
                    variant={mode === 'sessions' ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                        setMode('sessions');
                        setInputValue((task.targetSessions || 0).toString());
                    }}
                >
                    Sessions
                </Button>
                <Button
                    variant={mode === 'hours' ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                        setMode('hours');
                        // Calculate hours from current target sessions
                        const hours = ((task.targetSessions || 0) * focusDuration) / 60;
                        setInputValue(hours > 0 ? hours.toFixed(1) : "0");
                    }}
                >
                    <Clock className="w-3 h-3 mr-2" />
                    Total Time
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    id="target-input"
                    type="number"
                    min={0}
                    step={mode === 'hours' ? 0.5 : 1}
                    value={inputValue}
                    onChange={(e) => handleUpdate(e.target.value, mode)}
                    className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-20">
                    {mode === 'sessions' ? 'sessions' : 'hours'}
                </span>
            </div>

            {mode === 'hours' && calculatedSessions > 0 ? (
                <p className="text-xs text-muted-foreground flex items-center gap-2 bg-muted p-2 rounded-md">
                    <Clock className="w-3 h-3" />
                    Equals {calculatedSessions} sessions ({focusDuration}m each)
                </p>
            ) : null}
        </div>
    );
}
