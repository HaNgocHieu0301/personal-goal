export type GoalStatus = "todo" | "in-progress" | "done" | "blocked";

export interface GoalNode {
    id: string;
    title: string;
    description?: string;
    weight: number; // 1-10 or percentage
    progress: number; // 0-100 (calculated from children or manual)
    status: GoalStatus;
    children: GoalNode[];
    isExpanded?: boolean;
    parentId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    deadline?: Date | string; // Optional deadline, can be Date object or ISO string
    isFocus?: boolean; // Select for Warrior Mode (The Big 3)
    targetSessions?: number; // Number of sessions user needs to complete to auto-finish the goal
    completedSessions?: number; // Number of focus sessions completed for this task
    focusDuration?: number; // Individual focus duration in minutes
    targetPeriod?: string; // e.g. "2026-02"
}

export interface UserMetrics {
    momentum: number; // 0-100
    streak: number; // days
    lastActive: Date;
}
