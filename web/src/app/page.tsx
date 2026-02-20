"use client";

import { useState, useEffect } from "react";

import { GoalTree } from "@/components/goal-tree";
import { TaskCard } from "@/components/task-card";
import { useGoals } from "@/hooks/use-goals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crosshair, LayoutDashboard, ListChecks, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "@/components/settings-dialog";

export default function Home() {
  const { data: goals, isLoading, error } = useGoals();

  // State for active task selection in Warrior Mode
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Helper to find focused nodes recursively
  const getFocusedNodes = (nodes: any[]): any[] => {
    let focusNodes: any[] = [];
    nodes.forEach(node => {
      if (node.isFocus) focusNodes.push(node);
      if (node.children?.length > 0) {
        focusNodes = [...focusNodes, ...getFocusedNodes(node.children)];
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

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-background text-foreground">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="flex w-full justify-center lg:justify-start border-b border-border bg-background pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4">
          Personal Goal OS&nbsp;
          <code className="font-mono font-bold">v0.1.0</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <SettingsDialog />
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <Tabs defaultValue="architect" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="architect">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Architect
              </TabsTrigger>
              <TabsTrigger value="warrior">
                <Crosshair className="w-4 h-4 mr-2" />
                Warrior
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="architect" className="mt-0">
            <GoalTree />
          </TabsContent>

          <TabsContent value="warrior" className="mt-0 flex flex-col items-center w-full min-h-[400px]">
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
              <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
                {/* Mission List */}
                <div className="w-full md:w-1/3 space-y-4 font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold flex items-center">
                      <ListChecks className="mr-2 h-5 w-5 text-primary" />
                      Mission Queue
                    </h2>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {focusedTasks.length}
                    </span>
                  </div>

                  <ScrollArea className="h-[400px] w-full rounded-md border p-1 border-primary/20 bg-card/30">
                    <div className="space-y-2 p-1">
                      {focusedTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setActiveTaskId(task.id)}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent group",
                            activeTaskId === task.id
                              ? "bg-accent border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/5"
                              : "bg-card/50 border-border opacity-70 hover:opacity-100"
                          )}
                        >
                          <h3 className={cn(
                            "font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors",
                            task.status === "done" && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 ">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              task.status === "done" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                                task.status === "in-progress" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-300"
                            )} />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Active Task (Mission Control) */}
                <div className="w-full md:w-2/3 flex flex-col items-center">
                  {activeTask ? (
                    <div className="w-full max-w-md space-y-4">
                      <div className="text-center mb-2 hidden md:block">
                        <h2 className="text-xl font-bold tracking-tight">Active Mission</h2>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] mt-1 text-primary animate-pulse">
                          Focus Mode Engaged
                        </p>
                      </div>
                      <TaskCard task={activeTask} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground font-mono py-20">
                      Select a mission to start
                    </div>
                  )}
                </div>
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
        </Tabs>
      </div>
    </main>
  );
}
