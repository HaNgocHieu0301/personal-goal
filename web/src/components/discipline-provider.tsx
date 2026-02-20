"use client";

import { useQuery } from "@tanstack/react-query";
import { DisciplineOverlay } from "./discipline-overlay";
import { useEffect, useState } from "react";

export function DisciplineProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data } = useQuery({
        queryKey: ["discipline-status"],
        queryFn: async () => {
            const res = await fetch("http://localhost:8080/api/v1/discipline/status");
            if (!res.ok) throw new Error("Failed to fetch discipline status");
            return res.json();
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
