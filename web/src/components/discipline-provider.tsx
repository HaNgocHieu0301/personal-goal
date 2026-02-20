"use client";

import { useQuery } from "@tanstack/react-query";
import { DisciplineOverlay } from "./discipline-overlay";
import { useEffect, useState } from "react";
import { api } from "@/hooks/use-goals";

export function DisciplineProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data } = useQuery({
        queryKey: ["discipline-status"],
        queryFn: async () => {
            const { data } = await api.get("/discipline/status");
            return data;
        },
        refetchInterval: 60000, // Check every minute
        refetchOnWindowFocus: true,
    });

    if (!mounted) {
        return <>{children}</>;
    }

    const isViolated = data?.status === "pending";

    return (
        <>
            {children}
            {isViolated && <DisciplineOverlay violationId={data.violation.id} />}
        </>
    );
}
