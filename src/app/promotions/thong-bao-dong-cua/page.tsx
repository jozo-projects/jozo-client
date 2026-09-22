import Typography from "@/components/ui/typography";
import { CLOSURE_MESSAGE, MAINTENANCE_FROM } from "@/config/closure";
import { AlertTriangle, ArrowLeft, CalendarOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thông báo đóng cửa tạm thời | Jozo",
  description:
    "Từ ngày 28/02/2026 Jozo tạm ngưng đóng cửa để sửa chữa. Không nhận đặt phòng và không áp dụng chương trình khuyến mãi.",
  alternates: { canonical: "/promotions/thong-bao-dong-cua" },
  openGraph: {
    title: "Thông báo đóng cửa tạm thời | Jozo",
    description: CLOSURE_MESSAGE,
    url: "/promotions/thong-bao-dong-cua",
    type: "article",
  },
};

export default function TemporaryClosurePage() {
  const fromDate = new Date(MAINTENANCE_FROM).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="py-6 sm:py-8">
        <Link href="/" className="back-link">
          <ArrowLeft />
          Quay lại trang chủ
        </Link>

        <div className="glass-surface overflow-hidden rounded-2xl max-w-3xl mx-auto">
          {/* Header */}
          <div className="border-b border-white/10 bg-amber-500/20 px-6 py-8 text-foreground md:px-10 md:py-10">
            <div className="flex items-start gap-4">
                <AlertTriangle
                className="mt-1 h-10 w-10 shrink-0 text-amber-300"
                aria-hidden
              />
              <div>
                <Typography
                  as="h1"
                  variant="bold"
                  className="page-title mb-2"
                >
                  Thông báo đóng cửa tạm thời
                </Typography>
                <Typography
                  as="p"
                  variant="default"
                  className="text-foreground/80 text-lg"
                >
                  Jozo tạm ngưng hoạt động để sửa chữa, nâng cấp
                </Typography>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-10 space-y-6">
            <div className="glass-control border-l-4 border-amber-400 p-4 rounded">
              <Typography
                as="p"
                variant="semibold"
                className="text-foreground text-lg"
              >
                {CLOSURE_MESSAGE}
              </Typography>
            </div>

            <ul className="space-y-3 text-primary/80">
              <li className="flex items-center gap-3">
                <CalendarOff className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span>
                  <strong>Không nhận đặt phòng</strong> — Mọi đặt box tạm thời
                  bị tạm ngưng từ ngày {fromDate}.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span>
                  <strong>Không áp dụng khuyến mãi</strong> — Các chương trình
                  ưu đãi sẽ tạm ngừng trong thời gian này.
                </span>
              </li>
            </ul>

            <Typography as="p" variant="default" className="text-primary/70">
              Jozo xin lỗi quý khách vì sự bất tiện này. Khi mở cửa trở lại,
              thông tin sẽ được cập nhật trên website và fanpage. Cảm ơn quý
              khách đã ủng hộ!
            </Typography>

            <div className="pt-4 border-t border-primary/12">
              <Typography
                as="p"
                variant="default"
                className="text-primary/55 text-sm"
              >
                Có thắc mắc vui lòng liên hệ:{" "}
                <a
                  href="tel:0359660934"
                  className="text-primary font-medium hover:underline"
                >
                  035 966 0934
                </a>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
