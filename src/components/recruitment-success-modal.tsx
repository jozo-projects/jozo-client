"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect } from "react";

interface RecruitmentSuccessModalProps {
  isOpen: boolean;
  applicantName: string;
  onClose: () => void;
}

export function RecruitmentSuccessModal({
  isOpen,
  applicantName,
  onClose,
}: RecruitmentSuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = applicantName.trim() || "bạn";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="glass-overlay relative w-full max-w-md rounded-xl p-6 shadow-lg md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recruitment-success-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-7 w-7 text-emerald-600" strokeWidth={2.5} />
        </div>
        <h2
          id="recruitment-success-title"
          className="mb-3 text-center text-lg font-semibold text-foreground md:text-xl"
        >
          Gửi đơn ứng tuyển thành công
        </h2>
        <p className="text-center text-sm leading-relaxed text-primary/65 md:text-base">
          Jozo sẽ chủ động liên hệ cho bạn{" "}
          <span className="font-medium text-foreground">{displayName}</span> trong
          thời gian sớm nhất. Cảm ơn bạn nhé!
        </p>
        <div className="mt-6 flex justify-center">
          <Button type="button" onClick={onClose} size="lg">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
