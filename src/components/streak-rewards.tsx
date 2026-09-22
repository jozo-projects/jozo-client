"use client";

import { extractGiftId, normalizeObjectId } from "@/lib/object-id";
import type { Gift } from "@/types/gift";
import { useMemo, useState } from "react";

type StreakReward = {
  count: number;
  bonusPoints: number;
  giftId?: string;
  gift?: Gift;
};

type Props = {
  windowDays: number;
  currentCount: number;
  rewards: StreakReward[];
};

const visitLabel = (visit: number) => `Lượt ${visit}`;

const giftTypeLabel: Record<Gift["type"], string> = {
  snacks_drinks: "Đồ ăn & thức uống",
  discount_percentage: "Voucher giảm giá",
  discount_amount: "Voucher giảm giá",
  discount: "Voucher giảm giá",
};

const formatGiftValue = (gift: Gift) => {
  if (gift.discountAmount) {
    return `Giảm ${gift.discountAmount.toLocaleString("vi-VN")}đ`;
  }
  if (gift.discountPercentage) {
    return `Giảm ${gift.discountPercentage}%`;
  }
  if (gift.price) {
    return `Trị giá ${gift.price.toLocaleString("vi-VN")}đ`;
  }
  return null;
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

export function StreakRewards({ windowDays, currentCount, rewards }: Props) {
  const cappedWindow = Math.max(1, Math.min(windowDays || 0, 60));

  const rewardMap = useMemo(() => {
    const map = new Map<number, StreakReward>();
    rewards?.forEach((reward) => {
      map.set(reward.count, {
        ...reward,
        gift: reward.gift,
        giftId: extractGiftId(reward) || reward.giftId,
      });
    });
    return map;
  }, [rewards]);

  const [selected, setSelected] = useState<StreakReward | null>(null);
  const selectedGift = selected?.gift;

  return (
    <div className="space-y-3">
      <style jsx>{`
        @keyframes shimmerGift {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Lượt sử dụng</p>
          <p className="text-xs text-foreground/70">
            {currentCount} / {cappedWindow} lượt · Chạm vào mốc để xem quà
          </p>
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
        }}
      >
        {Array.from({ length: cappedWindow }).map((_, idx) => {
          const day = idx + 1;
          const active = day <= currentCount;
          const reward = rewardMap.get(day);
          const isNext = day === currentCount + 1;
          const giftId = reward ? extractGiftId(reward) : null;
          const hasGiftConfig = Boolean(reward?.gift || giftId);

          return (
            <button
              key={day}
              type="button"
              onClick={() => reward && hasGiftConfig && setSelected(reward)}
              className={`relative flex h-14 w-full items-center justify-center rounded-xl border text-[11px] font-semibold overflow-hidden transition focus:outline-none ${
                active
                  ? "bg-emerald-500/20 border-emerald-300/40 text-emerald-100 shadow-sm"
                  : "glass-control text-foreground/70"
              } ${isNext ? "ring-2 ring-emerald-300" : ""} ${
                reward && hasGiftConfig
                  ? "hover:-translate-y-[1px] hover:shadow"
                  : ""
              }`}
              title={
                reward
                  ? `Mốc ${day}: +${reward.bonusPoints} điểm${
                      reward.gift ? ` · ${reward.gift.name}` : ""
                    }`
                  : visitLabel(day)
              }
            >
              {reward ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center relative">
                  {hasGiftConfig && (
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        background:
                          "linear-gradient(110deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.18) 45%, rgba(16,185,129,0.08) 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmerGift 2.2s linear infinite",
                      }}
                    />
                  )}

                  <div className="relative flex flex-col items-center gap-1">
                    {hasGiftConfig ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-300/30 animate-pulse">
                        <GiftIcon className="h-5 w-5" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-foreground/70">
                        Quà tặng
                      </span>
                    )}
                  </div>
                </div>
              ) : active ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/25 ring-1 ring-emerald-300/40 text-[11px] font-bold text-emerald-100">
                  ✓
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-foreground/75">
                  {visitLabel(day)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-overlay relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="glass-control absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-semibold text-foreground"
            >
              Đóng
            </button>

            <div className="space-y-1 pr-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Mốc {selected.count}/{cappedWindow}
              </p>
              <h3 className="text-lg font-bold text-foreground">
                Phần thưởng mốc này
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="glass-control rounded-xl border-l-4 border-amber-400 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                  Điểm thưởng
                </p>
                <p className="mt-1 text-2xl font-extrabold text-foreground">
                  +{selected.bonusPoints.toLocaleString("vi-VN")} điểm
                </p>
              </div>

              {selectedGift ? (
                <div className="glass-control space-y-3 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {selectedGift.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedGift.image}
                        alt={selectedGift.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover border border-emerald-300/30 bg-emerald-500/10"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-emerald-300/40 bg-emerald-500/10 text-emerald-200">
                        <GiftIcon className="h-8 w-8" />
                      </div>
                    )}

                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        Quà tặng kèm
                      </p>
                      <p className="text-base font-bold text-foreground">
                        {selectedGift.name}
                      </p>
                      <p className="text-xs text-foreground/70">
                        {giftTypeLabel[selectedGift.type]}
                      </p>
                      {formatGiftValue(selectedGift) ? (
                        <p className="text-sm font-semibold text-emerald-200">
                          {formatGiftValue(selectedGift)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {selectedGift.items && selectedGift.items.length > 0 ? (
                    <div className="space-y-2 rounded-xl border border-white/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                          Danh sách món trong quà
                        </p>
                      </div>
                      <ul className="space-y-2">
                        {selectedGift.items.map((item, index) => (
                          <li
                            key={`${normalizeObjectId(item.itemId) || item.name}-${index}`}
                            className="glass-control flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {item.name}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold text-emerald-100">
                              x{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-emerald-300/30 px-4 py-3 text-sm text-foreground/70">
                      Quà này chưa có danh sách món chi tiết.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-foreground/70">
                  Không tìm thấy thông tin quà cho mốc này.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
