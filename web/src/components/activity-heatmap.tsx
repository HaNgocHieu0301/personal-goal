"use client";
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/hooks/use-goals";
import { format, eachDayOfInterval, formatISO, startOfYear, endOfYear } from "date-fns";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2, Flame } from "lucide-react";

interface HeatmapData {
    date: string;
    score: number;
    sessions: number;
    weight: number;
    tasks: number;
}

export function ActivityHeatmap() {
    const { data, isPending, isError } = useQuery<HeatmapData[]>({
        queryKey: ["activity-heatmap"],
        queryFn: async () => {
            const { data } = await api.get("/activity/heatmap");
            return data;
        },
        retry: false, // Don't retry on failure to avoid the "5s hang"
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const { dataMap, maxScore } = useMemo(() => {
        const map = new Map<string, HeatmapData>();
        let max = 1;
        data?.forEach((d: HeatmapData) => {
            map.set(d.date.split("T")[0], d);
            if (d.score > max) max = d.score;
        });
        return { dataMap: map, maxScore: max };
    }, [data]);

    const weeks = useMemo(() => {
        const today = new Date();
        const startDate = startOfYear(today);
        const endDate = endOfYear(today);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const wks: (Date | null)[][] = [];
        let currentWeek: (Date | null)[] = [];

        days.forEach((day: Date) => {
            if (currentWeek.length === 0 && day.getDay() !== 0 && wks.length === 0) {
                for (let i = 0; i < day.getDay(); i++) {
                    currentWeek.push(null);
                }
            }

            currentWeek.push(day);

            if (day.getDay() === 6 || currentWeek.length === 7) {
                wks.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            wks.push(currentWeek);
        }
        return wks;
    }, []);

    if (isPending) {
        return (
            <div className="flex items-center justify-center p-8 border rounded-xl bg-card">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return null; // Don't show anything if there's an error
    }


    const getLevel = (score: number) => {
        if (score === 0) return 0;
        const ratio = score / maxScore;
        if (ratio < 0.25) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 0.75) return 3;
        return 4;
    };

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0:
                // Increased contrast for empty cells: Slate/Zinc with subtle border
                return "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50";
            case 1: return "bg-emerald-500/20 border border-emerald-500/10";
            case 2: return "bg-emerald-500/45 border border-emerald-500/20";
            case 3: return "bg-emerald-500/75 border border-emerald-500/30";
            case 4: return "bg-emerald-600 border border-emerald-400/30";
            default: return "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50";
        }
    };

    // Check if a date is today
    const isToday = (date: Date) => {
        const today = new Date();
        return formatISO(date, { representation: 'date' }) === formatISO(today, { representation: 'date' });
    };


    return (
        <div className="w-full bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-5 mb-8 shadow-sm group">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5">
                        <Flame className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight text-foreground/90">Momentum Heatmap</h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-70">Focus Activity 2026</p>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                    {format(new Date(), "EEEE, MMM do")}
                </div>
            </div>

            <TooltipProvider delayDuration={0}>
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-1 min-w-max">
                        {weeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-1">
                                {week.map((day, dIdx) => {
                                    if (!day) {
                                        return <div key={dIdx} className="w-3 h-3 rounded-[3px] opacity-0" />;
                                    }

                                    const dateStr = formatISO(day, { representation: 'date' });
                                    const dayData = dataMap.get(dateStr);
                                    const score = dayData?.score || 0;
                                    const level = getLevel(score);

                                    const cellDiv = (
                                        <div
                                            title={!dayData ? `${format(day, "MMM dd, yyyy")}: No activity` : undefined}
                                            className={cn(
                                                "w-3 h-3 rounded-[3px] transition-all cursor-pointer relative",
                                                getLevelColor(level),
                                                isToday(day) ? "ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-zinc-950 z-10" : "hover:ring-1 hover:ring-emerald-500/50"
                                            )}
                                        />
                                    );

                                    // CONDITIONAL TOOLTIP: Only wrap in Radix Tooltip if there's actual data to show
                                    if (!dayData) {
                                        return <div key={dIdx} className="relative group">{cellDiv}</div>;
                                    }

                                    return (
                                        <Tooltip key={dIdx}>
                                            <TooltipTrigger asChild>
                                                {cellDiv}
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs bg-slate-900 border-none font-mono text-white p-3 shadow-xl pointer-events-none">
                                                <p className="font-bold mb-2 pb-1 border-b border-white/20">{format(day, "MMM dd, yyyy")}</p>
                                                <div className="space-y-1">
                                                    <p className="flex justify-between gap-4"><span>Tasks Done:</span> <span className="text-green-400 font-bold">{dayData.tasks}</span></p>
                                                    <p className="flex justify-between gap-4"><span>Sessions:</span> <span className="text-blue-400 font-bold">{dayData.sessions}</span></p>
                                                    <p className="flex justify-between gap-4"><span>Weight:</span> <span className="text-amber-400 font-bold">{dayData.weight}</span></p>
                                                    <p className="text-muted-foreground/50 mt-2 font-bold flex justify-between gap-4 border-t border-white/10 pt-1">
                                                        <span>Total Score:</span> <span>{dayData.score.toFixed(1)}</span>
                                                    </p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </TooltipProvider>

            <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-muted-foreground/80 font-medium tracking-tight">
                <span>Less activity</span>
                <div className="flex gap-1 mx-1">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/20" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/45" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/75" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" />
                </div>
                <span>More</span>
                <div className="ml-4 flex items-center gap-1.5 opacity-60">
                    <div className="w-2.5 h-2.5 rounded-[2px] border-2 border-orange-500" />
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
}
