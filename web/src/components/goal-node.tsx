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

interface GoalNodeProps {
    node: GoalNode;
    level?: number;
    onUpdate?: () => void;
}

export function GoalNodeItem({ node, level = 0, onUpdate }: GoalNodeProps) {
    const { toggleExpand, updateStatus, deleteGoal, addGoal, toggleFocus } = useGoalStore();
    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState("");

    const handleAddChild = () => {
        if (newGoalTitle.trim()) {
            addGoal(node.id, newGoalTitle);
            setNewGoalTitle("");
            setIsAdding(false);
        }
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
                    "group flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/50 transition-colors",
                    level === 0 && "py-2"
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                <button
                    onClick={() => toggleExpand(node.id)}
                    className="p-0.5 hover:bg-muted rounded"
                >
                    {node.children.length > 0 ? (
                        node.isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )
                    ) : (
                        <div className="w-4 h-4" /> // Spacer
                    )}
                </button>

                <div className="flex items-center gap-2 flex-1">
                    <button onClick={() => updateStatus(node.id, node.status === 'done' ? 'todo' : 'done')}>
                        {getStatusIcon()}
                    </button>

                    <span className={cn(
                        "font-medium text-sm",
                        node.status === "done" && "text-muted-foreground line-through"
                    )}>
                        {node.title}
                    </span>

                    {node.deadline && (
                        <div className="flex items-center text-xs text-muted-foreground ml-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(node.deadline), "MMM d")}
                        </div>
                    )}

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
                        className={cn(
                            "h-6 w-6 text-muted-foreground hover:text-orange-500",
                            node.isFocus && "text-orange-500 bg-orange-500/10"
                        )}
                        onClick={() => toggleFocus(node.id)}
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
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => deleteGoal(node.id)}
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
                        onBlur={() => setIsAdding(false)}
                        className="h-7 text-sm"
                        placeholder="New goal..."
                    />
                </div>
            )}

            {node.isExpanded && node.children.length > 0 && (
                <div className="flex flex-col border-l border-border/40 ml-[15px]">
                    {node.children.map((child) => (
                        <GoalNodeItem key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
