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

    const isDailyTask = !task.parentId && !task.targetPeriod;
    const deadlineToUse = task.deadline ? new Date(task.deadline) : (isDailyTask ? new Date() : null);

    return (
        <Card className="w-full max-w-lg mx-auto border-slate-200/60 dark:border-primary/20 bg-white/80 dark:bg-neutral-900/40 backdrop-blur-xl shadow-2xl dark:shadow-primary/5 relative overflow-hidden group">
            {/* Subtle light effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-primary/20 blur pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-0 pt-4 px-6 relative z-10">
                <div className="flex items-center gap-3">
                    <Badge variant={task.status === "in-progress" ? "default" : "secondary"} className="uppercase tracking-widest text-[9px] h-4">
                        {task.status}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
                        Node: {task.id.slice(0, 8)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none">Weight</span>
                        <span className="text-xs font-bold font-mono">{task.weight}</span>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="xs" className="h-6 w-6 p-0 rounded-md border-primary/10 hover:border-primary/30 transition-all">
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Task Configuration</h4>
                                <p className="text-sm text-muted-foreground italic">
                                    Define sessions or time targets for auto-completion.
                                </p>
                                <TargetSessionsConfig task={task} />
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-4 pb-6 px-6 relative z-10">
                {/* Title & Description Block */}
                <div className="space-y-3 text-center">
                    <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                        {task.title}
                    </CardTitle>
                    {task.description && (
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed italic border-l-2 border-primary/20 pl-4 py-0.5">
                            {task.description}
                        </p>
                    )}
                    {deadlineToUse && (
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-mono text-primary/80">
                            <Calendar className="h-3 w-3 mr-1.5" />
                            <span>TERMINAL: {format(deadlineToUse, "yyyy.MM.dd")}</span>
                        </div>
                    )}
                </div>

                {/* Session Progress Indicators */}
                {targetSessions > 0 && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {Array.from({ length: targetSessions }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                        i < (task.completedSessions || 0)
                                            ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                            : "bg-slate-200 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700/50"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[9px] font-bold font-mono text-primary/40 uppercase tracking-widest">
                            {task.completedSessions || 0} / {targetSessions} Sessions
                        </span>
                    </div>
                )}

                {/* The Improved Timer Component */}
                <FocusTimer onSessionComplete={handleSessionComplete} task={task} />
            </CardContent>

            <CardFooter className="px-6 pb-6 pt-0 relative z-10">
                <Button
                    variant="outline"
                    onClick={handleComplete}
                    disabled={updateGoalMutation.isPending || task.status === "done"}
                    className={cn(
                        "w-full rounded-xl border-slate-200 dark:border-primary/20 h-12 text-sm font-bold group/btn relative overflow-hidden transition-all shadow-sm dark:shadow-lg",
                        task.status === "done"
                            ? "bg-green-500/10 text-green-500 border-green-500/30"
                            : "hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary hover:border-primary/40 active:scale-95 hover:shadow-primary/5"
                    )}
                >
                    {updateGoalMutation.isPending ? (
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    ) : task.status === "done" ? (
                        <CheckCircle2 className="mr-3 h-5 w-5 animate-bounce" />
                    ) : (
                        <CheckCircle2 className="mr-3 h-5 w-5 transition-transform group-hover/btn:scale-110" />
                    )}
                    {task.status === "done" ? "MISSION ACCOMPLISHED" : "COMPLETE MISSION"}
                </Button>
            </CardFooter>

            {/* Corner decorations for OS feel */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-slate-200 dark:border-primary/20 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-slate-200 dark:border-primary/20 rounded-bl-xl" />
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
        const effectiveDuration = task.focusDuration || focusDuration;
        if (currentMode === 'hours') {
            // Calculate sessions needed for this hours based on current focus duration settings
            const totalMinutesNeeded = val * 60;
            sessions = Math.ceil(totalMinutesNeeded / effectiveDuration);
        } else {
            sessions = Math.floor(val);
        }

        updateGoalMutation.mutate({
            ...task,
            targetSessions: sessions
        });
    };

    const effectiveDuration = task.focusDuration || focusDuration;
    const parsedVal = parseFloat(inputValue);
    const calculatedSessions = !isNaN(parsedVal) && mode === 'hours'
        ? Math.ceil((parsedVal * 60) / effectiveDuration)
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
                        const effectiveDuration = task.focusDuration || focusDuration;
                        const hours = ((task.targetSessions || 0) * effectiveDuration) / 60;
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
                    Equals {calculatedSessions} sessions ({task.focusDuration || focusDuration}m each)
                </p>
            ) : null}

            <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor="focus-duration-input" className="text-sm font-medium">Individual Focus Time</Label>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Scope: Task Only</span>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        id="focus-duration-input"
                        type="number"
                        min={0}
                        value={task.focusDuration || ""}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateGoalMutation.mutate({
                                ...task,
                                focusDuration: isNaN(val) ? 0 : val
                            });
                        }}
                        className="flex-1"
                        placeholder={`${focusDuration} (default)`}
                    />
                    <span className="text-xs text-muted-foreground w-20">minutes</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                    If left empty or 0, the system will use the default setting ({focusDuration} min).
                </p>
            </div>
        </div>
    );
}
