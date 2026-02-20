"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";

export function SettingsDialog() {
    const { focusDuration, setFocusDuration } = useSettingsStore();
    const [durationInput, setDurationInput] = useState(focusDuration.toString());
    const [open, setOpen] = useState(false);

    const handleSave = () => {
        const valDuration = parseInt(durationInput, 10);

        if (!isNaN(valDuration) && valDuration > 0) {
            setFocusDuration(valDuration);
        }

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (val) {
                setDurationInput(focusDuration.toString());
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 mt-2">
                    <div className="space-y-4">
                        <h4 className="flex items-center text-sm font-medium leading-none text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            Warrior Timer Options
                        </h4>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="focus-duration" className="text-right">
                                Focus Time
                            </Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input
                                    id="focus-duration"
                                    type="number"
                                    value={durationInput}
                                    onChange={(e) => setDurationInput(e.target.value)}
                                    className="w-20"
                                    min={1}
                                />
                                <span className="text-sm text-muted-foreground">minutes</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
