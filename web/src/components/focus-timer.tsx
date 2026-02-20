"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSettingsStore } from "@/stores/settings-store";

interface FocusTimerProps {
    onSessionComplete?: () => void;
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

export function FocusTimer({ onSessionComplete }: FocusTimerProps = {}) {
    const { focusDuration } = useSettingsStore();
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const prevDurationRef = useRef(focusDuration);

    // Update time left if settings change while not active
    useEffect(() => {
        if (prevDurationRef.current !== focusDuration) {
            prevDurationRef.current = focusDuration;
            if (!isActive) {
                setTimeLeft(focusDuration * 60);
            }
        }
    }, [focusDuration, isActive]);

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
        setTimeLeft(focusDuration * 60);
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100;

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
