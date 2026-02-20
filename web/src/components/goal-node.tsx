"use client";

import { GoalNode } from "@/types";
import { useGoalStore } from "@/stores/goal-store";
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Trash,
    Circle,
    CheckCircle2,
    CircleDashed,
    Calendar,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useState } from "react";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
    useCreateGoal,
    useUpdateGoal,
    useDeleteGoal,
    useToggleFocus
} from "@/hooks/use-goals";

interface GoalNodeProps {
    node: GoalNode;
    level?: number;
}

export function GoalNodeItem({ node, level = 0 }: GoalNodeProps) {
    const { expandedNodeIds, toggleExpand } = useGoalStore();
    const createGoalMutation = useCreateGoal();
    const updateGoalMutation = useUpdateGoal();
    const deleteGoalMutation = useDeleteGoal();
    const toggleFocusMutation = useToggleFocus();

    const isExpanded = expandedNodeIds.has(node.id);

    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [editTitle, setEditTitle] = useState(node.title);

    const handleAddChild = () => {
        if (newGoalTitle.trim()) {
            createGoalMutation.mutate({ title: newGoalTitle, parentId: node.id });
            setNewGoalTitle("");
            setIsAdding(false);
        }
    };

    const handleRename = () => {
        if (editTitle.trim() && editTitle !== node.title) {
            updateGoalMutation.mutate({ ...node, title: editTitle });
        }
        setIsEditing(false);
    };

    const handleStatusToggle = () => {
        const nextStatus = node.status === 'done' ? 'todo' : 'done';
        updateGoalMutation.mutate({ ...node, status: nextStatus });
    };

    const getStatusIcon = () => {
        switch (node.status) {
            case "done":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "in-progress":
                return <CircleDashed className="h-4 w-4 text-blue-500 animate-pulse" />;
            default:
                return <Circle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="flex flex-col select-none">
            <div
                className={cn(
                    "group flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 transition-colors text-foreground",
                    level === 0 && "py-2"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                <button
                    onClick={() => toggleExpand(node.id)}
                    className="p-0.5 hover:bg-muted rounded text-muted-foreground"
                >
                    {node.children && node.children.length > 0 ? (
                        isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )
                    ) : (
                        <div className="w-4 h-4" /> // Spacer
                    )}
                </button>

                <div className="flex items-center gap-2 flex-1">
                    <button
                        onClick={handleStatusToggle}
                        disabled={updateGoalMutation.isPending}
                        className="p-0.5 hover:bg-muted rounded"
                    >
                        {statusIconByGoalStatus(node.status)}
                    </button>

                    {isEditing ? (
                        <Input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename();
                                if (e.key === "Escape") {
                                    setEditTitle(node.title);
                                    setIsEditing(false);
                                }
                            }}
                            onBlur={handleRename}
                            className="h-7 text-sm py-0 flex-1 bg-background focus-visible:ring-1"
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditing(true)}
                            className={cn(
                                "font-medium text-sm cursor-text hover:text-primary transition-colors",
                                node.status === "done" && "text-muted-foreground line-through"
                            )}
                        >
                            {node.title}
                        </span>
                    )}

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "flex items-center text-xs text-muted-foreground ml-2 hover:text-foreground transition-colors",
                                    !node.deadline && "opacity-0 group-hover:opacity-100"
                                )}
                            >
                                <Calendar className="h-3 w-3 mr-1" />
                                {node.deadline ? format(new Date(node.deadline), "MMM d") : "Set date"}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={node.deadline ? new Date(node.deadline) : undefined}
                                onSelect={(date) => {
                                    updateGoalMutation.mutate({
                                        ...node,
                                        deadline: date ? date.toISOString() : undefined
                                    });
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    {node.progress > 0 && (
                        <div className="w-16 ml-2">
                            <Progress value={node.progress} className="h-1.5" />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={cn(
                    "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    (isHovered || node.isFocus) && "opacity-100"
                )}>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={toggleFocusMutation.isPending}
                        className={cn(
                            "h-6 w-6 text-muted-foreground hover:text-orange-500",
                            node.isFocus && "text-orange-500 bg-orange-500/10 opacity-100"
                        )}
                        onClick={() => toggleFocusMutation.mutate(node.id)}
                        title="Toggle Warrior Focus"
                    >
                        <Target className="h-3 w-3" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsAdding(true)}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={deleteGoalMutation.isPending}
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => deleteGoalMutation.mutate(node.id)}
                    >
                        <Trash className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {isAdding && (
                <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}>
                    <div className="w-4 h-4" />
                    <Input
                        autoFocus
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddChild();
                            if (e.key === "Escape") setIsAdding(false);
                        }}
                        onBlur={handleAddChild}
                        className="h-7 text-sm"
                        placeholder="New goal..."
                    />
                </div>
            )}

            {isExpanded && node.children && node.children.length > 0 && (
                <div className="flex flex-col border-l border-border/40 ml-[15px]">
                    {node.children.map((child) => (
                        <GoalNodeItem key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

function statusIconByGoalStatus(status: GoalNode["status"]) {
    switch (status) {
        case "done":
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case "in-progress":
            return <CircleDashed className="h-4 w-4 text-blue-500 animate-pulse" />;
        default:
            return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
}
