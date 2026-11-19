"use client";

import { Flame, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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

export function StreakRewards({ currentCount, rewards }: Props) {
  const milestones = useMemo(
    () => [...(rewards || [])].sort((a, b) => a.count - b.count),
    [rewards],
  );

  const [selected, setSelected] = useState<StreakReward | null>(null);
  const claimedItems = selected?.claimedItems ?? [];
  const itemCount = selected?.itemCount ?? 0;
  const maxMilestone = milestones[milestones.length - 1]?.count ?? 0;
  const nextMilestone = milestones.find((reward) => reward.count > currentCount);
  const gridEnd = Math.max(maxMilestone, currentCount);
  const visibleVisits = Array.from({ length: gridEnd }, (_, index) => index + 1);

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
      <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-rose-500/25 via-fuchsia-500/10 to-slate-950/40 p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-4xl font-extrabold leading-none">{currentCount.toLocaleString("vi-VN")}</p>
            <p className="mt-2 text-sm font-semibold">lượt streak</p>
            <p className="mt-1 text-sm text-white/70">
              {nextMilestone
                ? `Còn ${nextMilestone.count - currentCount} lượt để đến mốc ${nextMilestone.count}`
                : milestones.length > 0
                  ? "Khách iu đã đạt tất cả mốc quà"
                  : "Tích lũy qua mỗi lần sử dụng dịch vụ"}
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-400 text-rose-950" aria-hidden="true">
            <Flame className="h-8 w-8" fill="currentColor" />
          </span>
        </div>
        <div className="mt-5 grid grid-cols-10 gap-y-1" aria-label={`Tiến trình ${currentCount} lượt trên ${gridEnd} lượt`}>
          {visibleVisits.map((visit) => {
            const milestone = milestones.find((reward) => reward.count === visit);
            const reached = visit <= currentCount;
            const circle = `flex h-6 w-6 items-center justify-center rounded-full border ${
              milestone
                ? reached
                  ? "border-amber-200 bg-amber-300 text-amber-950 ring-2 ring-amber-300/40"
                  : "border-amber-300 bg-amber-400/20 text-amber-200 ring-2 ring-amber-300/30"
                : reached
                  ? "border-rose-400 bg-rose-400 text-white"
                  : "border-white/40 text-white/60"
            }`;
            return milestone ? (
              <button
                key={visit}
                type="button"
                onClick={() => setSelected(milestone)}
                aria-label={`Xem phần thưởng mốc ${visit} lượt, ${reached ? "đã đạt" : "chưa đạt"}`}
                className="flex min-h-11 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                <span className={circle}><GiftIcon className="h-4 w-4" /></span>
              </button>
            ) : (
              <span key={visit} className="flex min-h-11 items-center justify-center" aria-hidden="true">
                <span className={circle}>{reached && <Flame className="h-3 w-3" fill="currentColor" />}</span>
              </span>
            );
          })}
        </div>
      </div>

      {selected && createPortal(
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
                  Mốc {selected.count}
                  {maxMilestone > 0 ? `/${maxMilestone}` : ""}
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
              {(itemCount > 0 || claimedItems.length > 0) && (
                <p className="border-t border-white/10 pt-3 text-sm leading-relaxed text-foreground/70">
                  Khi nhận quà streak, hóa đơn đó không áp dụng giảm giá theo % hạng thành viên.
                </p>
              )}
            </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
