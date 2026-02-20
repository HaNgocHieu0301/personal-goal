import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
    focusDuration: number; // in minutes
    setFocusDuration: (minutes: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            focusDuration: 25,
            setFocusDuration: (minutes: number) => set({ focusDuration: Math.max(1, minutes) }),
        }),
        {
            name: "personal-goal-settings",
        }
    )
);
