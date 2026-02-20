"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const REQUIRED_TEXT = "Tôi xác nhận đã nộp phạt vào quỹ tự phạt và cam kết sẽ kỷ luật hơn.";

export function DisciplineOverlay({ violationId }: { violationId: string }) {
    const [commitmentText, setCommitmentText] = useState("");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const queryClient = useQueryClient();

    const resolveMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("http://localhost:8080/api/v1/discipline/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: violationId,
                    reason,
                    commitmentText: REQUIRED_TEXT // Backend validates this exact string
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to resolve violation");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discipline-status"] });
        },
        onError: (err: any) => {
            setError(err.message);
        }
    });

    const isCommitmentValid = commitmentText === REQUIRED_TEXT;
    const isReasonValid = reason.length >= 10;
    const isSubmitEnabled = isCommitmentValid && isReasonValid && !resolveMutation.isPending;

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        setError("Không được copy-paste. Vui lòng tự gõ để rèn luyện kỷ luật!");
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-xl w-full mx-auto space-y-8 animate-in zoom-in-95 duration-700">

                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                        <ShieldAlert className="w-10 h-10 text-destructive animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-widest text-destructive">
                        Kỷ Luật Thép Bị Kích Hoạt
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        Hệ thống phát hiện bạn đã vi phạm mục tiêu vào ngày hôm qua. Không có đường lùi, chỉ có sự sửa sai.
                    </p>
                </div>

                <div className="bg-card/50 border border-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-destructive" />

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                1. Cam Kết Hình Phạt
                                {isCommitmentValid && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </label>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm font-mono opacity-80 select-none">
                                Gõ chính xác đoạn văn bản sau để xác nhận:
                                <br />
                                <span className="font-bold text-foreground mt-2 inline-block">
                                    "{REQUIRED_TEXT}"
                                </span>
                            </div>
                            <Input
                                placeholder="Nhập phần text tại đây..."
                                value={commitmentText}
                                onChange={(e) => {
                                    setCommitmentText(e.target.value);
                                    setError(""); // clear error on type
                                }}
                                onPaste={handlePaste}
                                className={cn(
                                    "h-12 border-primary/20 bg-background",
                                    isCommitmentValid ? "border-green-500 focus-visible:ring-green-500" : ""
                                )}
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                2. Lý Do Khách Quan?
                                {isReasonValid && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </label>
                            <Textarea
                                placeholder="Tại sao bạn lại thất bại ngày hôm qua? (Tối thiểu 10 ký tự)"
                                value={reason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                                className="min-h-[120px] resize-none border-primary/20 bg-background"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            className={cn(
                                "w-full h-14 text-base font-bold tracking-widest uppercase transition-all",
                                isSubmitEnabled
                                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                                    : "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!isSubmitEnabled}
                            onClick={() => resolveMutation.mutate()}
                        >
                            {resolveMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Chấp Nhận Nộp Phạt & Mở Khóa"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
