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
}

export interface UserMetrics {
    momentum: number; // 0-100
    streak: number; // days
    lastActive: Date;
}
