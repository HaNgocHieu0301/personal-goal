"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function FocusTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="text-6xl font-mono font-bold tracking-tighter">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <Progress value={progress} className="h-2 w-full max-w-xs" />
            <div className="flex gap-4">
                <Button size="lg" onClick={toggle} className={isActive ? "bg-amber-500 hover:bg-amber-600" : ""}>
                    {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                    {isActive ? "Pause" : "Focus"}
                </Button>
                <Button size="icon" variant="outline" onClick={reset}>
                    <Square className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
