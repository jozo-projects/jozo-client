type TierThreshold = [string, number];

export type TierBenefit = {
  discountPercentage?: number;
  discountAmount?: number;
  note?: string;
};

type MembershipTierProgressProps = {
  tierThresholds: TierThreshold[];
  maxThreshold: number;
  absolutePercent: number;
  currentTier?: string | null;
  currentPoints?: number;
  tierBenefits?: Record<string, TierBenefit[]>;
};

const benefitsForTier = (
  tierBenefits: Record<string, TierBenefit[]> | undefined,
  tier: string,
) => {
  if (!tierBenefits) return [];
  const direct = tierBenefits[tier];
  if (Array.isArray(direct)) return direct;
  const match = Object.entries(tierBenefits).find(
    ([name]) => name.toLowerCase() === tier.toLowerCase(),
  );
  return match && Array.isArray(match[1]) ? match[1] : [];
};

const formatBenefit = (benefit: TierBenefit) => {
  if (
    typeof benefit.discountPercentage === "number" &&
    benefit.discountPercentage > 0
  ) {
    return `Giảm ${benefit.discountPercentage}%`;
  }
  if (typeof benefit.discountAmount === "number" && benefit.discountAmount > 0) {
    return `Giảm ${benefit.discountAmount.toLocaleString("vi-VN")}đ`;
  }
  if (benefit.discountPercentage === 0) {
    return "Chưa giảm giá";
  }
  return null;
};

export function MembershipTierProgress({
  tierThresholds,
  maxThreshold,
  absolutePercent,
  currentTier,
  currentPoints = 0,
  tierBenefits,
}: MembershipTierProgressProps) {
  const percent = Math.min(100, Math.max(0, absolutePercent || 0));

  return (
    <div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến độ hạng thành viên"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-white to-amber-200"
          style={{ width: `${percent}%` }}
        />
      </div>

      {tierThresholds.length > 0 && maxThreshold > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {tierThresholds.map(([tier, value]) => {
            const reached = currentPoints >= value;
            const isCurrent =
              currentTier?.toLowerCase() === tier.toLowerCase();

            return (
              <div
                key={tier}
                className={`min-h-16 min-w-0 rounded-xl border px-3 py-2.5 text-left ${
                  isCurrent
                    ? "border-white bg-white text-red-700"
                    : reached
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-white/15 bg-black/20 text-white/75"
                }`}
              >
                <p className="truncate text-sm font-bold capitalize">{tier}</p>
                <p
                  className={`mt-0.5 text-xs font-medium ${
                    isCurrent ? "text-red-700/70" : "text-inherit opacity-80"
                  }`}
                >
                  {value.toLocaleString("vi-VN")} điểm
                </p>
                {benefitsForTier(tierBenefits, tier).map((benefit) => {
                  const label = formatBenefit(benefit);
                  if (!label) return null;
                  return (
                    <p
                      key={label}
                      className={`mt-1 text-xs font-semibold ${
                        isCurrent ? "text-red-700" : "text-amber-200"
                      }`}
                    >
                      {label}
                      {benefit.note ? ` · ${benefit.note}` : ""}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
