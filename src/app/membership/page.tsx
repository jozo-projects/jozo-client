import Typography from "@/components/ui/typography";
import {
  getMembershipConfig,
  sortTierThresholds,
} from "@/lib/membership-config";
import {
  ArrowLeft,
  Cake,
  ChevronUp,
  Gift,
  PartyPopper,
  Star,
  Utensils,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chương trình Thành viên Jozo | Ưu đãi minh bạch",
  description:
    "Thành viên Jozo: theo dõi thời gian sử dụng, ưu đãi giảm 10%, tích điểm. Mọi quyền lợi minh bạch — không thuế, không phí dịch vụ phát sinh.",
  alternates: { canonical: "/membership" },
  openGraph: {
    title: "Chương trình Thành viên Jozo | Ưu đãi minh bạch",
    description:
      "Đăng ký thành viên Jozo: theo dõi thời gian sử dụng, giảm 10%, tích điểm. Minh bạch — không thuế, không phí dịch vụ.",
    url: "/membership",
    images: ["/images/member-poster-final.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chương trình Thành viên Jozo | Ưu đãi minh bạch",
    description:
      "Thành viên Jozo: theo dõi thời gian, ưu đãi minh bạch — không thuế, không phí dịch vụ phát sinh.",
    images: ["/images/member-poster-final.webp"],
  },
};

const formatPoints = (n: number) => n.toLocaleString("vi-VN");
const formatVnd = (n: number) => n.toLocaleString("vi-VN");

export default async function MembershipPage() {
  const config = await getMembershipConfig();
  const tiers = sortTierThresholds(config?.tierThresholds);
  const streakRewards = [...(config?.streak?.rewards || [])].sort(
    (a, b) => a.count - b.count,
  );
  const windowDays = config?.streak?.windowDays ?? 0;
  const pointPerCurrency = config?.pointPerCurrency ?? 0;
  const currencyUnit = config?.currencyUnit ?? 0;
  const birthdayMultiplier = config?.bonusRules?.birthdayMultiplier ?? 1;

  const streakMilestones =
    streakRewards.length > 0
      ? streakRewards.map((r) => r.count).join(" / ")
      : "3 / 5 / 10";

  const benefits = [
    {
      icon: Cake,
      title: "Ưu đãi sinh nhật",
      description:
        birthdayMultiplier > 1
          ? `Trong ngày sinh nhật, điểm tích lũy được nhân ${birthdayMultiplier} lần. Vui lòng cập nhật ngày sinh trong tài khoản để áp dụng.`
          : "Thành viên nhận ưu đãi đặc biệt trong tháng sinh nhật theo quy định chương trình.",
    },
    {
      icon: Star,
      title: "Tích điểm khi sử dụng dịch vụ",
      description:
        pointPerCurrency > 0 && currencyUnit > 0
          ? `Mỗi ${formatVnd(currencyUnit)} đồng chi tiêu được cộng ${formatPoints(pointPerCurrency)} điểm vào tài khoản thành viên.`
          : "Mỗi lần sử dụng dịch vụ tại Jozo, điểm sẽ được cộng vào tài khoản thành viên.",
    },
    {
      icon: ChevronUp,
      title: "Thăng hạng thành viên",
      description:
        tiers.length > 0
          ? `Chương trình gồm ${tiers.length} hạng. Điểm tích lũy càng cao, hạng thành viên càng được nâng cấp cùng quyền lợi tương ứng.`
          : "Điểm tích lũy đạt ngưỡng sẽ được nâng hạng thành viên và mở quyền lợi tương ứng.",
    },
    {
      icon: Gift,
      title: `Quà tặng theo mốc ${streakMilestones} lần`,
      description:
        windowDays > 0
          ? `Trong vòng ${windowDays} ngày, thành viên đạt đủ số lần sử dụng dịch vụ sẽ nhận điểm thưởng và quà tặng theo từng mốc.`
          : "Thành viên đạt đủ số lần sử dụng dịch vụ theo từng mốc sẽ nhận quà tặng tương ứng.",
    },
    {
      icon: Utensils,
      title: "Ưu đãi kèm theo",
      description:
        "Thành viên có thể nhận snack, đồ uống hoặc thời gian sử dụng bổ sung theo chính sách áp dụng tại từng thời điểm.",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="py-6 sm:py-8">
        <Link href="/" className="back-link">
          <ArrowLeft />
          Quay lại trang chủ
        </Link>

        <div className="glass-surface overflow-hidden rounded-2xl">
          <div className="relative bg-gradient-to-br from-[#0f1118] via-[#1a0a0c] to-[#0b0c12] px-6 py-10 md:px-10 md:py-14 text-white overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,40,40,0.35),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.08),transparent_35%)]" />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  <PartyPopper className="h-3.5 w-3.5" />
                  Chính thức từ 10/7/2026
                </span>
                <Typography
                  as="h1"
                  variant="bold"
                  className="text-3xl md:text-4xl leading-tight"
                >
                  Chương trình Thành viên Jozo
                </Typography>
                <div className="inline-flex items-center rounded-xl border-2 border-white/30 bg-primary px-4 py-2 shadow-[0_0_24px_rgba(220,38,38,0.45)]">
                  <span className="text-xl md:text-2xl font-extrabold tracking-wide">
                    GIẢM NGAY 10%
                  </span>
                </div>
                <Typography
                  as="p"
                  variant="default"
                  className="text-white/80 text-base md:text-lg"
                >
                  Đăng ký miễn phí để trở thành hội viên và nhận ngay ưu đãi giảm
                  10%, cùng hệ thống tích điểm và quyền lợi dành riêng cho thành
                  viên.
                </Typography>
              </div>

              <div className="relative mx-auto w-full max-w-sm">
                <div className="relative aspect-[1086/1448] w-full overflow-hidden rounded-xl border border-white/15 shadow-2xl">
                  <Image
                    src="/images/member-poster-final.webp"
                    alt="Poster Chương trình Thành viên Jozo"
                    fill
                    sizes="(min-width: 768px) 384px, 90vw"
                    className="object-contain bg-black"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-10">
            <div className="rounded-xl border-l-4 border-primary bg-accent/60 p-4">
              <Typography
                as="p"
                variant="semibold"
                className="text-base leading-relaxed text-foreground sm:text-lg"
              >
                Từ ngày <strong>10/7/2026</strong>, khách hàng đăng ký thành viên
                Jozo sẽ được giảm 10% khi sử dụng dịch vụ, đồng thời tham gia hệ
                thống tích điểm và nhận các quyền lợi theo hạng thành viên.
              </Typography>
            </div>

            <section>
              <Typography
                as="h2"
                variant="semibold"
                className="section-title mb-4"
              >
                Quyền lợi thành viên
              </Typography>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="glass-surface rounded-xl p-5"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Typography
                      as="h3"
                      variant="semibold"
                      className="card-title mb-1"
                    >
                      {title}
                    </Typography>
                    <Typography
                      as="p"
                      variant="default"
                      className="body-copy"
                    >
                      {description}
                    </Typography>
                  </div>
                ))}
              </div>
            </section>

            {tiers.length > 0 && (
              <section>
                <Typography
                  as="h2"
                  variant="semibold"
                  className="section-title mb-4"
                >
                  Hạng thành viên
                </Typography>
                {pointPerCurrency > 0 && currencyUnit > 0 && (
                  <Typography
                    as="p"
                    variant="default"
                    className="body-copy mb-4"
                  >
                    Tỷ lệ tích điểm: {formatPoints(pointPerCurrency)} điểm /{" "}
                    {formatVnd(currencyUnit)} đồng.
                  </Typography>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {tiers.map(([name, points], index) => (
                    <div
                      key={name}
                      className="glass-surface flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-primary/50">
                          Hạng {index + 1}
                        </p>
                        <p className="font-semibold text-foreground capitalize truncate">
                          {name}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-primary">
                        từ {formatPoints(points)} điểm
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {streakRewards.length > 0 && (
              <section>
                <Typography
                  as="h2"
                  variant="semibold"
                  className="section-title mb-4"
                >
                  Quà tặng theo số lần sử dụng
                </Typography>
                {windowDays > 0 && (
                  <Typography
                    as="p"
                    variant="default"
                    className="body-copy mb-4"
                  >
                    Số lần sử dụng được ghi nhận trong vòng {windowDays} ngày.
                    Thành viên đạt từng mốc sẽ nhận phần thưởng tương ứng.
                  </Typography>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {streakRewards.map((reward) => (
                    <div
                      key={reward.count}
                      className="glass-surface rounded-xl p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        Mốc {reward.count} lần
                      </p>
                      <p className="text-sm text-primary/70 mt-1">
                        +{formatPoints(reward.bonusPoints)} điểm thưởng
                        {reward.itemCount
                          ? ` và ${reward.itemCount} phần quà`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <Typography
                as="h2"
                variant="semibold"
                className="section-title mb-4"
              >
                Cách tham gia
              </Typography>
              <ol className="list-decimal list-inside space-y-2 text-primary/80">
                <li>
                  Đăng ký tài khoản thành viên trên website Jozo (miễn phí).
                </li>
                <li>
                  Đăng nhập khi đặt chỗ hoặc sử dụng dịch vụ tại Jozo để áp dụng
                  ưu đãi thành viên.
                </li>
                <li>
                  Tích điểm, thăng hạng và nhận quà tặng theo các mốc của chương
                  trình.
                </li>
              </ol>
            </section>

            <section>
              <Typography
                as="h2"
                variant="semibold"
                className="section-title mb-4"
              >
                Điều khoản & lưu ý
              </Typography>
              <ul className="list-disc list-inside space-y-2 text-primary/80">
                <li>
                  Chương trình chính thức áp dụng từ ngày 10/7/2026.
                </li>
                <li>
                  Ưu đãi giảm 10% và các quyền lợi khác được áp dụng theo quy
                  định trên hệ thống và tại điểm kinh doanh.
                </li>
                <li>Ưu đãi giảm 10% không áp dụng cho các ngày lễ.</li>
                <li>Ưu đãi không được quy đổi thành tiền mặt.</li>
                <li>
                  Jozo có quyền điều chỉnh nội dung chương trình. Mọi thắc mắc
                  vui lòng liên hệ hotline hoặc nhân viên tại quầy.
                </li>
              </ul>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap pt-2">
              <Link
                href="/register"
                className="bg-primary hover:bg-brand-hover text-primary-foreground font-semibold py-3 px-8 rounded-lg transition-colors text-center shadow-lg shadow-primary/25"
              >
                Đăng ký thành viên
              </Link>
              <a
                href="tel:0359660934"
                className="glass-control text-foreground font-semibold py-3 px-8 rounded-lg text-center"
              >
                Liên hệ: 035 966 0934
              </a>
            </div>

            <div className="pt-4 border-t border-primary/12 text-center">
              <Typography as="p" variant="default" className="text-primary/70">
                <strong>Hotline:</strong> 035 966 0934
                <br />
                <strong>Địa chỉ:</strong> 30 Phan Trung, P. Tam Hiệp, Đồng Nai
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
