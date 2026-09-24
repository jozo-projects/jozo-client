"use client";

import { Check, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type StreakGiftItem = {
  itemId?: string;
  name: string;
  quantity?: number;
  category?: string;
  image?: string;
};

type StreakReward = {
  count: number;
  bonusPoints: number;
  itemCount?: number;
  claimedItems?: StreakGiftItem[];
};

type Props = {
  windowDays: number;
  currentCount: number;
  rewards: StreakReward[];
};

const GiftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20 7h-1.18A3 3 0 0 0 21 5a3 3 0 0 0-5.4-1.6L14.62 5H9.38l-1-1.6A3 3 0 0 0 3 5a3 3 0 0 0 2.18 2H4a1 1 0 0 0-1 1v3.5A2.5 2.5 0 0 0 5.5 14H6v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6h.5A2.5 2.5 0 0 0 21 11.5V8a1 1 0 0 0-1-1ZM17 4a1 1 0 0 1 0 2h-2.12ZM7 4 9.12 6H7a1 1 0 0 1 0-2Zm3 16H8v-6h2Zm6 0h-2v-6h2Zm2.5-8.5a.5.5 0 0 1-.5.5H5.5a.5.5 0 0 1-.5-.5V9h14Z" />
  </svg>
);

export function StreakRewards({
  windowDays,
  currentCount,
  rewards,
}: Props) {
  const cappedWindow = Math.max(1, Math.min(windowDays || 0, 60));

  const milestones = useMemo(
    () => [...(rewards || [])].sort((a, b) => a.count - b.count),
    [rewards],
  );

  const [selected, setSelected] = useState<StreakReward | null>(null);
  const claimedItems = selected?.claimedItems ?? [];
  const itemCount = selected?.itemCount ?? 0;
  const visitPercent = Math.min(
    100,
    Math.round((currentCount / cappedWindow) * 100),
  );
  const nextMilestone = milestones.find((reward) => reward.count > currentCount);

  useEffect(() => {
    if (!selected) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Lượt sử dụng</p>
            <p className="mt-0.5 text-sm text-foreground/70">
              Trong {cappedWindow} ngày gần nhất
            </p>
          </div>
          <p className="text-right text-2xl font-extrabold leading-none text-foreground">
            {currentCount}
            <span className="text-sm font-semibold text-foreground/55">
              /{cappedWindow}
            </span>
          </p>
        </div>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={currentCount}
          aria-valuemin={0}
          aria-valuemax={cappedWindow}
          aria-label="Số lượt sử dụng"
        >
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${visitPercent}%` }}
          />
        </div>
      </div>

      {milestones.length > 0 && (
        <ul className="space-y-2">
          {milestones.map((reward) => {
            const reached = currentCount >= reward.count;
            const isNext = nextMilestone?.count === reward.count;
            const received = reward.claimedItems ?? [];
            const detail =
              received.length > 0
                ? `Đã nhận: ${received.map((item) => item.name).join(", ")}`
                : reward.itemCount
                  ? `tặng ${reward.itemCount} món bất kỳ, trừ trái cây`
                  : "";

            return (
              <li key={reward.count}>
                <button
                  type="button"
                  onClick={() => setSelected(reward)}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${
                    reached
                      ? "border-emerald-300/40 bg-emerald-500/15"
                      : isNext
                        ? "border-amber-300/50 bg-amber-400/10"
                        : "glass-control"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      reached
                        ? "bg-emerald-400/25 text-emerald-100"
                        : "bg-white/10 text-foreground/80"
                    }`}
                  >
                    {reached ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <GiftIcon className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        Mốc {reward.count} lượt
                      </span>
                      {isNext && (
                        <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-[11px] font-semibold text-amber-100">
                          Tiếp theo
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-foreground/70">
                      +{reward.bonusPoints.toLocaleString("vi-VN")} điểm
                      {detail ? ` · ${detail}` : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-foreground/45" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Đóng"
            onClick={() => setSelected(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="streak-reward-title"
            className="glass-overlay relative flex max-h-[85vh] w-full flex-col rounded-t-3xl sm:max-w-md sm:rounded-2xl"
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-white/25" />
            </div>
            <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Mốc {selected.count}/{cappedWindow}
                </p>
                <h3
                  id="streak-reward-title"
                  className="text-lg font-bold text-foreground"
                >
                  Phần thưởng mốc này
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="glass-control flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 pb-6">
            <div className="space-y-4">
              <div className="glass-control rounded-xl border-l-4 border-amber-400 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                  Điểm thưởng
                </p>
                <p className="mt-1 text-2xl font-extrabold text-foreground">
                  +{selected.bonusPoints.toLocaleString("vi-VN")} điểm
                </p>
              </div>

              {claimedItems.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Món đã nhận
                  </p>
                  <ul className="space-y-2">
                    {claimedItems.map((item, index) => (
                      <li
                        key={`${item.itemId || item.name}-${index}`}
                        className="glass-control flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                      >
                        <p className="min-w-0 text-sm font-semibold text-foreground">
                          {item.name}
                        </p>
                        <span className="shrink-0 rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold text-emerald-100">
                          x{item.quantity || 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : itemCount > 0 ? (
                <p className="text-sm leading-relaxed text-foreground/80">
                  Được tặng{" "}
                  <span className="font-semibold text-foreground">
                    {itemCount} món bất kỳ
                  </span>
                  , trừ trái cây.
                </p>
              ) : null}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
