"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils";

import { GoalNode } from "@/types";

interface FocusTimerProps {
    onSessionComplete?: () => void;
    task?: GoalNode;
}

const playCompletionSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // A pleasant subtle "ding" sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6 note

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
};

export function FocusTimer({ onSessionComplete, task }: FocusTimerProps = {}) {
    const { focusDuration: globalFocusDuration } = useSettingsStore();

    const effectiveDuration = (task?.focusDuration && task.focusDuration > 0)
        ? task.focusDuration
        : globalFocusDuration;

    const [timeLeft, setTimeLeft] = useState(effectiveDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const prevDurationRef = useRef(effectiveDuration);

    useEffect(() => {
        if (prevDurationRef.current !== effectiveDuration) {
            prevDurationRef.current = effectiveDuration;
            if (!isActive) {
                setTimeLeft(effectiveDuration * 60);
            }
        }
    }, [effectiveDuration, isActive]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
            playCompletionSound();
            if (onSessionComplete) {
                onSessionComplete();
            }
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, onSessionComplete]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setTimeLeft(effectiveDuration * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalSeconds = effectiveDuration * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

    // SVG Circle properties
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-6 w-full py-2">
            {/* Immersive Circular Timer */}
            <div className="relative flex items-center justify-center">
                {/* Background Glow */}
                <div className={cn(
                    "absolute inset-0 rounded-full blur-2xl transition-all duration-1000",
                    isActive ? "bg-primary/20 scale-110 opacity-100" : "bg-primary/5 scale-100 opacity-50"
                )} />

                <svg className="w-52 h-52 transform -rotate-90">
                    {/* Background Ring */}
                    <circle
                        cx="104"
                        cy="104"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-slate-200 dark:text-primary/10"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="104"
                        cy="104"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s linear" }}
                        strokeLinecap="round"
                        fill="transparent"
                        className={cn(
                            "text-primary transition-all duration-500",
                            isActive && "animate-pulse-subtle"
                        )}
                    />
                </svg>

                {/* Countdown Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={cn(
                        "text-6xl font-mono font-bold tracking-tighter transition-all duration-300",
                        isActive ? "scale-105 text-primary" : "text-slate-900 dark:text-foreground/80"
                    )}>
                        {String(minutes).padStart(2, "0")}
                        <span className={cn(isActive && "animate-pulse")}>:</span>
                        {String(seconds).padStart(2, "0")}
                    </div>
                </div>
            </div>

            {/* Task Info & Controls */}
            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
                {task?.focusDuration && task.focusDuration > 0 && (
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary/80 font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20 backdrop-blur-sm">
                        Custom Mission Duration: {task.focusDuration}m
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button
                        size="xl"
                        onClick={toggle}
                        className={cn(
                            "w-40 h-14 text-lg font-bold transition-all shadow-xl",
                            isActive
                                ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                                : "bg-primary hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        {isActive ? (
                            <>
                                <Pause className="mr-3 h-6 w-6 fill-current" />
                                PAUSE
                            </>
                        ) : (
                            <>
                                <Play className="mr-3 h-6 w-6 fill-current" />
                                FOCUS
                            </>
                        )}
                    </Button>
                    <Button
                        size="icon-xl"
                        variant="outline"
                        onClick={reset}
                        className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all"
                    >
                        <Square className="h-6 w-6 fill-muted-foreground/20" />
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; stroke-width: 8; }
                    50% { opacity: 0.8; stroke-width: 9; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
