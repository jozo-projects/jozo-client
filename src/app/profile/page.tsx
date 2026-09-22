import { getDisplayName, pickAvatarUrl } from "@/lib/auth-helpers";
import { getCurrentUser } from "@/lib/auth-server";
import { cookies } from "next/headers";
import { StreakRewards } from "../../components/streak-rewards";
import { ProfileAccountMenu } from "@/components/profile-account-menu";
import { MembershipTierProgress } from "@/components/membership-tier-progress";
import { computeMembershipProgress } from "@/lib/membership-utils";
import { getActiveGifts } from "@/lib/gifts";
import { resolveGiftForReward } from "@/lib/gift-matching";
import type { Gift } from "@/types/gift";

type MembershipResult = {
  message?: string;
  user?: Record<string, unknown>;
  config?: {
    tierThresholds?: Record<string, number>;
    pointPerCurrency?: number;
    currencyUnit?: number;
    dailySelfClaimLimitPerPhone?: number;
    streak?: {
      windowDays?: number;
      rewards?: { count: number; bonusPoints: number; giftId?: string }[];
    };
  };
  progress?: {
    currentTier?: string;
    currentPoints?: number;
    points?: number;
    nextTier?: { tier?: string; required?: number };
  };
  streak?: { count?: number; windowDays?: number; isActive?: boolean };
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

  const profileRows = [
    { label: "Tên hiển thị", value: displayName },
    { label: "Username", value: member?.username || "—" },
    { label: "Email", value: member?.email || "—" },
    {
      label: "Số điện thoại",
      value: member?.phone || member?.phone_number || "—",
    },
    { label: "Ngày sinh", value: dateOfBirth },
  ];

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let membershipResult: MembershipResult | null = null;
  let gifts: Gift[] = [];
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

    try {
      if (membershipResult) {
        gifts = await getActiveGifts();
      }
    } catch (error) {
      console.error("Lấy danh sách quà thất bại", error);
    }
  }

  const tierThresholds =
    membershipResult?.config?.tierThresholds &&
    Object.entries(membershipResult.config.tierThresholds).sort(
      (a, b) => a[1] - b[1],
    );
  const streakRewards = (membershipResult?.config?.streak?.rewards || []).map(
    (reward) => ({
      ...reward,
      gift: resolveGiftForReward(reward, gifts),
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
    <div className="max-w-2xl mx-auto w-full space-y-5 pb-10">
      {/* Quyền lợi & Điểm */}
      {membershipResult && (
        <section className="space-y-4">
          <div className="relative rounded-2xl border border-red-100/40 bg-gradient-to-br from-[#0f1118] via-[#161822] to-[#0b0c12] p-4 sm:p-5 text-white shadow-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,66,66,0.2),transparent_35%)]" />
            <div className="relative space-y-4">
              <div className="space-y-1">
                <p className="meta-copy uppercase tracking-wide">
                  Hạng
                </p>
                <p className="text-2xl font-extrabold">
                  {currentTier || "Chưa có hạng"}
                </p>
                {nextTierName && remainingToNextTier !== null && (
                  <p className="meta-copy">
                    Còn{" "}
                    <span className="font-semibold text-amber-300">
                      {remainingToNextTier.toLocaleString("vi-VN")} điểm
                    </span>{" "}
                    để lên {nextTierName}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#b9131f] via-[#d5192c] to-[#f7422c] p-4 shadow-[0_8px_30px_rgba(220,38,38,0.3)]">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-3xl font-extrabold leading-none">
                      {currentPoints.toLocaleString("vi-VN")}
                    </p>
                    <p className="text-xs text-white/75 mt-1">
                      / {(maxThreshold || 0).toLocaleString("vi-VN")} điểm
                    </p>
                  </div>
                  {nextTierName && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold">
                      → {nextTierName}
                    </span>
                  )}
                </div>

                <MembershipTierProgress
                  tierThresholds={tierThresholds ?? []}
                  maxThreshold={maxThreshold}
                  absolutePercent={absolutePercent}
                />
              </div>
            </div>
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

      {/* Tài khoản — tách biệt khỏi quyền lợi */}
      <ProfileAccountMenu isAuthed={isAuthed} profileRows={profileRows} />
    </div>
  );
}
