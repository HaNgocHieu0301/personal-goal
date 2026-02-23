"use client";

import { useState, useEffect } from "react";

import { GoalTree } from "@/components/goal-tree";
import { TaskCard } from "@/components/task-card";
import { Plus, X, Crosshair, LayoutDashboard, ListChecks, Loader2, Maximize2, Minimize2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "@/components/settings-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useGoals, useCreateGoal, useDeleteGoal, useToggleFocus } from "@/hooks/use-goals";
import { GoalNode } from "@/types";

export default function Home() {
  const { data: goals, isLoading, error } = useGoals();

  // State for active task selection in Warrior Mode
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);

  // Quick task state for Warrior mode
  const [isAddingQuickTask, setIsAddingQuickTask] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const createGoalMutation = useCreateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const toggleFocusMutation = useToggleFocus();

  // Helper to find focused nodes recursively without duplicates
  const getFocusedNodes = (nodes: any[], seen = new Set<string>()): any[] => {
    let focusNodes: any[] = [];
    nodes.forEach(node => {
      if (seen.has(node.id)) return;
      seen.add(node.id);

      if (node.isFocus) focusNodes.push(node);
      if (node.children?.length > 0) {
        focusNodes = [...focusNodes, ...getFocusedNodes(node.children, seen)];
      }
    });
    return focusNodes;
  };

  const focusedTasks = goals ? getFocusedNodes(goals) : [];

  // Initialize active task when focused tasks change
  useEffect(() => {
    if (focusedTasks.length > 0) {
      if (!activeTaskId) {
        setActiveTaskId(focusedTasks[0].id);
      } else {
        const stillExists = focusedTasks.some(t => t.id === activeTaskId);
        if (!stillExists) setActiveTaskId(focusedTasks[0].id);
      }
    } else {
      setActiveTaskId(null);
    }
  }, [focusedTasks, activeTaskId]);

  const activeTask = focusedTasks.find(t => t.id === activeTaskId) || null;

  // Handle ESC key to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZenMode]);

  const handleAddQuickTask = () => {
    if (quickTaskTitle.trim()) {
      createGoalMutation.mutate({
        title: quickTaskTitle,
        isFocus: true,
        parentId: undefined,
        targetPeriod: undefined
      });
      setQuickTaskTitle("");
      setIsAddingQuickTask(false);
    }
  };

  const handleRemoveTask = (e: React.MouseEvent, task: GoalNode) => {
    e.stopPropagation();

    // Daily task: no parent AND no target period
    const isDailyTask = !task.parentId && !task.targetPeriod;

    if (isDailyTask) {
      deleteGoalMutation.mutate(task.id);
    } else {
      toggleFocusMutation.mutate(task.id);
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center p-4 md:p-8 bg-background text-foreground pb-24 md:pb-8 transition-colors">
      <Tabs defaultValue="architect" className="w-full flex flex-col items-center">

        {/* Global Header (Max-W-7xl) - Desktop & Tablet */}
        <div className={cn(
          "z-10 w-full max-w-7xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4 transition-all duration-500",
          isZenMode && "opacity-0 -translate-y-4 pointer-events-none h-0 mb-0 overflow-hidden"
        )}>

          {/* Brand / Logo */}
          <div className="w-full md:w-auto flex justify-center md:justify-start">
            <div className="flex items-center gap-2 border border-border/50 bg-background/50 backdrop-blur-xl px-4 py-2 rounded-xl shadow-sm">
              <span className="font-semibold tracking-tight">Personal Goal</span>
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono font-medium">v1.1.2</span>
            </div>
          </div>

          {/* Desktop Tabs (Hidden on mobile) */}
          <div className="hidden md:flex items-center">
            <TabsList className="grid w-[300px] grid-cols-2 bg-muted/40 border border-border/50 p-1 rounded-full h-10 shadow-inner">
              <TabsTrigger value="architect" className="rounded-full rounded-r-none transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-medium text-xs tracking-wider uppercase">
                <LayoutDashboard className="w-3.5 h-3.5 mr-2 opacity-70" />
                Architect
              </TabsTrigger>
              <TabsTrigger value="warrior" className="rounded-full rounded-l-none transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-medium text-xs tracking-wider uppercase">
                <Crosshair className="w-3.5 h-3.5 mr-2 opacity-70" />
                Warrior
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop Settings / Theme (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <SettingsDialog />
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (Fixed) */}
        <div className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-background/90 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-area-pb transition-all duration-500",
          isZenMode && "translate-y-full opacity-0 pointer-events-none"
        )}>
          <TabsList className="bg-transparent border-none p-0 h-auto gap-6 w-auto justify-start">
            <TabsTrigger value="architect" className="flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground h-auto p-1 focus:ring-0">
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-wide uppercase">Architect</span>
            </TabsTrigger>
            <TabsTrigger value="warrior" className="flex-col gap-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground h-auto p-1 focus:ring-0">
              <Crosshair className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-wide uppercase">Warrior</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center ml-auto">
            <ThemeToggle />
            <SettingsDialog />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-7xl">
          <TabsContent value="architect" className="mt-0 w-full animate-in fade-in duration-300">
            <GoalTree />
          </TabsContent>

          <TabsContent value="warrior" className="mt-0 flex flex-col items-center w-full min-h-[400px] animate-in fade-in duration-300">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-mono">Loading Mission Intel...</p>
              </div>
            ) : error ? (
              <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-center text-destructive w-full max-w-md mt-8">
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-sm opacity-80 mt-1">Warrior mode requires the mission database.</p>
              </div>
            ) : focusedTasks.length > 0 ? (
              <div className={cn(
                "grid gap-8 w-full min-h-[600px] items-start transition-all duration-500",
                isZenMode
                  ? "grid-cols-1 max-w-2xl mx-auto"
                  : "grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr_300px]"
              )}>

                {/* Sidebar: Mission List */}
                <div className={cn(
                  "space-y-4 font-mono md:sticky md:top-24 transition-all duration-500",
                  isZenMode && "opacity-0 -translate-x-8 pointer-events-none hidden"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold flex items-center uppercase tracking-widest text-slate-500 dark:text-muted-foreground/80">
                      <ListChecks className="mr-2 h-4 w-4 text-primary" />
                      Queue
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 dark:text-muted-foreground bg-slate-100 dark:bg-secondary px-2 py-0.5 rounded-full font-bold">
                        {focusedTasks.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={() => setIsAddingQuickTask(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {isAddingQuickTask && (
                    <div className="mb-4 animate-in slide-in-from-top-2 flex items-center gap-2">
                      <Input
                        autoFocus
                        placeholder="Add mission..."
                        className="h-8 font-mono text-xs bg-card/50 border-primary/30"
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddQuickTask();
                          if (e.key === 'Escape') setIsAddingQuickTask(false);
                        }}
                        onBlur={() => {
                          if (!quickTaskTitle.trim()) setIsAddingQuickTask(false);
                          else handleAddQuickTask();
                        }}
                      />
                    </div>
                  )}

                  <ScrollArea className="h-[500px] w-full rounded-xl border p-1 border-primary/10 bg-card/20 backdrop-blur-sm">
                    <div className="space-y-1.5 p-1">
                      {focusedTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setActiveTaskId(task.id)}
                          className={cn(
                            "p-2.5 rounded-lg border cursor-pointer transition-all hover:bg-primary/5 group relative",
                            activeTaskId === task.id
                              ? "bg-white dark:bg-primary/10 border-slate-300 dark:border-primary/50 shadow-sm ring-1 ring-slate-200/50 dark:ring-transparent"
                              : "bg-slate-50/50 dark:bg-transparent border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-4 w-4 rounded-full bg-background/50 border border-border opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleRemoveTask(e, task as GoalNode)}
                          >
                            <X className="h-2.5 w-2.5" />
                          </Button>
                          <h3 className={cn(
                            "font-medium text-xs line-clamp-1 group-hover:text-primary transition-colors",
                            task.status === "done" && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              task.status === "done" ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" :
                                task.status === "in-progress" ? "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" : "bg-slate-400/50"
                            )} />
                            <span className="text-[9px] uppercase tracking-tight text-muted-foreground font-mono">
                              {task.status}
                            </span>
                            {(() => {
                              const isDailyTask = !task.parentId && !task.targetPeriod;
                              const deadlineToUse = task.deadline ? new Date(task.deadline) : (isDailyTask ? new Date() : null);
                              if (!deadlineToUse) return null;

                              const isOverdue = deadlineToUse < new Date(new Date().setHours(0, 0, 0, 0));
                              return (
                                <>
                                  <span className="text-[9px] text-muted-foreground/30">•</span>
                                  <div className={cn(
                                    "flex items-center text-[9px] font-mono",
                                    isOverdue && task.status !== "done" ? "text-destructive font-bold inline-flex items-center rounded-sm bg-destructive/10 px-1" : "text-muted-foreground"
                                  )}>
                                    <Calendar className="w-2.5 h-2.5 mr-1" />
                                    {format(deadlineToUse, "MMM dd")}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Center: Mission Control */}
                <div className="flex flex-col items-center justify-center min-h-[500px] py-4">
                  {activeTask ? (
                    <div className={cn(
                      "w-full transition-all duration-700 ease-out",
                      isZenMode ? "scale-110 md:scale-125" : "scale-100"
                    )}>
                      <div className="flex items-center justify-center gap-4 mb-6 relative">
                        <p className="text-primary dark:text-primary text-[10px] uppercase tracking-[0.4em] font-black animate-pulse bg-white dark:bg-primary/5 shadow-sm dark:shadow-none inline-block px-4 py-1.5 rounded-full border border-slate-200 dark:border-primary/10">
                          Focus Mode Active
                        </p>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className={cn(
                            "rounded-full transition-all hover:bg-primary/10",
                            isZenMode && "fixed top-8 right-8 z-50 bg-background/50 backdrop-blur-md border border-border"
                          )}
                          onClick={() => setIsZenMode(!isZenMode)}
                          title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                        >
                          {isZenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <TaskCard task={activeTask} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl border-primary/10 text-muted-foreground font-mono opacity-50">
                      <Crosshair className="h-8 w-8 mb-4 animate-spin-slow" />
                      <p className="text-xs uppercase tracking-widest">Select Mission From Queue</p>
                    </div>
                  )}
                </div>

                {/* Right: Balance Spacer (LG+ only) */}
                <div className="hidden lg:block"></div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg text-center opacity-70 max-w-md mt-8 border-primary/20">
                <Crosshair className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Critical Tasks Selected</h3>
                <p className="text-muted-foreground text-sm">
                  Go to <span className="font-bold text-foreground">Architect Mode</span> and click the target icon <Crosshair className="inline h-3 w-3" /> on tasks you want to focus on today.
                </p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
