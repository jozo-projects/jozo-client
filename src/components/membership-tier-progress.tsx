type MembershipTierProgressProps = {
  absolutePercent: number;
};

export function MembershipTierProgress({ absolutePercent }: MembershipTierProgressProps) {
  const percent = Math.min(100, Math.max(0, absolutePercent || 0));

  return (
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
  );
}
