"use client";

import { GoalNode } from "@/types";
import { FocusTimer } from "./focus-timer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, ArrowRight, Calendar } from "lucide-react";
import { useGoalStore } from "@/stores/goal-store";
import { format } from "date-fns";

interface TaskCardProps {
    task: GoalNode;
}

export function TaskCard({ task }: TaskCardProps) {
    const { updateStatus } = useGoalStore();
    console.log("TaskCard task:", task); // Debugging deadline

    return (
        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Badge variant={task.status === "in-progress" ? "default" : "secondary"}>
                    {task.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                    Weight: {task.weight}
                </span>
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

                <FocusTimer />
            </CardContent>

            <CardFooter className="justify-center gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={() => updateStatus(task.id, "done")}
                    className="w-full hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/50"
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                </Button>
            </CardFooter>
        </Card>
    );
}
