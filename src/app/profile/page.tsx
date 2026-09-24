import { getDisplayName, pickAvatarUrl } from "@/lib/auth-helpers";
import { getCurrentUser } from "@/lib/auth-server";
import { cookies } from "next/headers";
import Image from "next/image";
import {
  StreakRewards,
  type StreakGiftItem,
} from "../../components/streak-rewards";
import { ProfileAccountMenu } from "@/components/profile-account-menu";
import {
  MembershipTierProgress,
  type TierBenefit,
} from "@/components/membership-tier-progress";
import { computeMembershipProgress } from "@/lib/membership-utils";

type MembershipResult = {
  message?: string;
  user?: Record<string, unknown>;
  config?: {
    tierThresholds?: Record<string, number>;
    pointPerCurrency?: number;
    currencyUnit?: number;
    dailySelfClaimLimitPerPhone?: number;
    tierBenefits?: Record<
      string,
      {
        discountPercentage?: number;
        discountAmount?: number;
        note?: string;
      }[]
    >;
    streak?: {
      windowDays?: number;
      rewards?: {
        count: number;
        bonusPoints: number;
        itemCount?: number;
      }[];
    };
  };
  claimedRewards?: {
    streakCount?: number;
    items?: StreakGiftItem[];
  }[];
  progress?: {
    currentTier?: string;
    currentPoints?: number;
    points?: number;
    nextTier?: { tier?: string; required?: number };
  };
  streak?: { count?: number; windowDays?: number; isActive?: boolean };
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const readNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const readTierBenefits = (raw: unknown): Record<string, TierBenefit[]> | undefined => {
  const record = asRecord(raw);
  if (!record) return undefined;

  const benefitsByTier: Record<string, TierBenefit[]> = {};
  for (const [tier, value] of Object.entries(record)) {
    const rows = Array.isArray(value) ? value : [value];
    const benefits = rows.flatMap((item) => {
      const row = asRecord(item);
      if (!row) return [];
      const benefit: TierBenefit = {
        discountPercentage: readNumber(row.discountPercentage),
        discountAmount: readNumber(row.discountAmount),
        note: typeof row.note === "string" && row.note.trim() ? row.note.trim() : undefined,
      };
      if (
        benefit.discountPercentage === undefined &&
        benefit.discountAmount === undefined &&
        !benefit.note
      ) {
        return [];
      }
      return [benefit];
    });
    if (benefits.length > 0) benefitsByTier[tier] = benefits;
  }

  return Object.keys(benefitsByTier).length > 0 ? benefitsByTier : undefined;
};

const parseMembershipResult = (payload: unknown): MembershipResult | null => {
  if (!payload || typeof payload !== "object") return null;
  const data =
    (payload as Record<string, unknown>).result ||
    (payload as Record<string, unknown>).data ||
    payload;
  if (!data || typeof data !== "object") return null;
  return data as MembershipResult;
};

const getAppApiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default async function ProfilePage() {
  const member = await getCurrentUser();

  const displayName = getDisplayName(member) || "Thành viên";
  const avatarUrl = pickAvatarUrl(member);

  const dateOfBirth = member?.date_of_birth
    ? new Date(member.date_of_birth as string).toLocaleDateString("vi-VN")
    : "—";

  const phone = String(member?.phone || member?.phone_number || "—");
  const profileRows = [
    { label: "Username", value: member?.username || "—" },
    { label: "Email", value: member?.email || "—" },
    { label: "Số điện thoại", value: phone },
    { label: "Ngày sinh", value: dateOfBirth },
  ];
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let membershipResult: MembershipResult | null = null;
  if (token) {
    try {
      const appApiUrl = getAppApiUrl();
      const membershipUrl = appApiUrl
        ? `${appApiUrl}/api/membership/me`
        : "/api/membership/me";

      const res = await fetch(membershipUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      const payload = await res.json();
      membershipResult = parseMembershipResult(payload);
    } catch (error) {
      console.error("Lấy membership thất bại", error);
    }

  }

  const configRecord = asRecord(membershipResult?.config);
  const resultRecord = asRecord(membershipResult);
  const tierThresholdSource =
    asRecord(configRecord?.tierThresholds) ?? asRecord(resultRecord?.tierThresholds);
  const tierThresholds = tierThresholdSource
    ? Object.entries(tierThresholdSource)
        .flatMap(([tier, points]) => {
          const value = readNumber(points);
          return value === undefined ? [] : [[tier, value] as [string, number]];
        })
        .sort((a, b) => a[1] - b[1])
    : undefined;
  const tierBenefits =
    readTierBenefits(configRecord?.tierBenefits) ??
    readTierBenefits(resultRecord?.tierBenefits);
  const claimedByCount = new Map<number, StreakGiftItem[]>();
  for (const reward of membershipResult?.claimedRewards || []) {
    const count = Number(reward.streakCount);
    if (!Number.isFinite(count) || !reward.items?.length) continue;
    claimedByCount.set(
      count,
      reward.items.filter((item) => item?.name),
    );
  }
  const streakRewards = (membershipResult?.config?.streak?.rewards || []).map(
    (reward) => ({
      ...reward,
      claimedItems: claimedByCount.get(reward.count),
    }),
  );
  const {
    currentTier,
    nextTierName,
    currentPoints,
    remainingToNextTier,
    maxThreshold,
    absolutePercent,
  } = computeMembershipProgress(membershipResult, tierThresholds || undefined);

  const isAuthed = Boolean(member);
  const streakWindowDays =
    membershipResult?.config?.streak?.windowDays ||
    membershipResult?.streak?.windowDays ||
    20;
  const streakCount = Math.max(0, membershipResult?.streak?.count ?? 0);

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 pb-8">
      <header className="glass-surface flex items-center gap-3 rounded-2xl p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary/20 text-primary">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-bold">
              {initials || "TV"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">
            {displayName}
          </p>
          <p className="truncate text-sm text-foreground/70">
            {isAuthed ? phone : "Chưa đăng nhập"}
          </p>
        </div>
        {currentTier && (
          <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold capitalize text-primary-foreground">
            {currentTier}
          </span>
        )}
      </header>

      {membershipResult && (
        <section className="space-y-4">
          <div className="space-y-3 text-white">
            <div>
              <p className="text-sm font-medium text-white/80">Điểm hiện có</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-4xl font-extrabold leading-none">
                  {currentPoints.toLocaleString("vi-VN")}
                </p>
                {nextTierName && (
                  <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-semibold">
                    → {nextTierName}
                  </span>
                )}
              </div>
              {nextTierName && remainingToNextTier !== null ? (
                <p className="mt-2 text-sm text-white/90">
                  Còn{" "}
                  <span className="font-semibold text-amber-200">
                    {remainingToNextTier.toLocaleString("vi-VN")} điểm
                  </span>{" "}
                  để lên {nextTierName}
                </p>
              ) : (
                <p className="mt-2 text-sm text-white/80">
                  / {(maxThreshold || 0).toLocaleString("vi-VN")} điểm
                </p>
              )}
            </div>

            <MembershipTierProgress
              tierThresholds={tierThresholds ?? []}
              maxThreshold={maxThreshold}
              absolutePercent={absolutePercent}
              currentTier={currentTier}
              currentPoints={currentPoints}
              tierBenefits={tierBenefits}
            />
          </div>

          <div className="glass-surface rounded-2xl p-4 sm:p-5">
            <StreakRewards
              windowDays={streakWindowDays}
              currentCount={streakCount}
              rewards={streakRewards}
            />
          </div>
        </section>
      )}

      <ProfileAccountMenu isAuthed={isAuthed} profileRows={profileRows} />
    </div>
  );
}
