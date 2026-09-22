import { notFound } from "next/navigation";
import { promotions } from "@/data/promotions";
import Typography from "@/components/ui/typography";
import PromotionContent from "@/components/promotion-content";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface PromotionPageProps {
  params: Promise<{ slug: string }>;
}

// Force static generation (SSG) - không dùng SSR
export const dynamic = "force-static";
export const dynamicParams = false; // 404 nếu slug không có trong generateStaticParams
export const revalidate = false; // Không revalidate, pure static

// Static Generation: Generate all promotion pages at build time
export async function generateStaticParams() {
  return promotions.map((promotion) => ({
    slug: promotion.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PromotionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const promotion = promotions.find((p) => p.slug === slug);

  if (!promotion) {
    return {
      title: "Không tìm thấy khuyến mãi",
    };
  }

  return {
    title: `${promotion.title} | Jozo Music Box`,
    description: promotion.shortDescription,
    alternates: {
      canonical: `/promotions/${promotion.slug}`,
    },
    openGraph: {
      title: promotion.title,
      description: promotion.shortDescription,
      url: `/promotions/${promotion.slug}`,
      images: [promotion.image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: promotion.title,
      description: promotion.shortDescription,
      images: [promotion.image],
    },
  };
}

export default async function PromotionDetailPage({
  params,
}: PromotionPageProps) {
  const { slug } = await params;
  const promotion = promotions.find((p) => p.slug === slug);

  if (!promotion) {
    notFound();
  }

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-6 sm:py-8">
        {/* Back button */}
        <Link href="/" className="back-link">
          <ArrowLeft />
          Quay lại trang chủ
        </Link>

        {/* Main content */}
        <div className="glass-surface overflow-hidden rounded-2xl">
          {/* Hero image */}
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={promotion.image}
              alt={promotion.title}
              fill
              sizes="(min-width: 1280px) 1216px, (min-width: 768px) calc(100vw - 2rem), 100vw"
              loading="eager"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <Typography
                as="h1"
                variant="bold"
                className="mb-2 text-2xl sm:text-3xl"
              >
                {promotion.title}
              </Typography>
              <div className="flex items-center text-sm md:text-base">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDate(promotion.postedAt)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            {/* Short description */}
            <div className="bg-accent/60 border-l-4 border-primary p-4 mb-8 rounded">
              <Typography
                as="p"
                variant="semibold"
                className="text-base leading-relaxed text-foreground sm:text-lg"
              >
                {promotion.shortDescription}
              </Typography>
            </div>

            {/* Full description - JSX Component */}
            <div className="prose prose-lg max-w-none">
              <PromotionContent promotionId={promotion.id} />
            </div>

            {/* CTA button */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              {promotion.id === "7" ? (
                <>
                  <Link
                    href="/register"
                    className="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
                  >
                    Đăng ký ngay!
                  </Link>
                  <Link
                    href="/membership"
                    className="glass-control rounded-xl px-6 py-3 text-center text-sm font-semibold text-foreground"
                  >
                    Xem chương trình thành viên
                  </Link>
                  <a
                    href="tel:0359660934"
                    className="glass-control rounded-xl px-6 py-3 text-center text-sm font-semibold text-foreground"
                  >
                    Liên hệ: 035 966 0934
                  </a>
                </>
              ) : (
                <>
                  <Link
                    href="/medium"
                    className="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
                  >
                    Đặt S-Box (1-5 người)
                  </Link>
                  <Link
                    href="/large"
                    className="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
                  >
                    Đặt box Large (6-8 người)
                  </Link>
                  <a
                    href="tel:0359660934"
                    className="glass-control rounded-xl px-6 py-3 text-center text-sm font-semibold text-foreground"
                  >
                    Liên hệ: 035 966 0934
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
