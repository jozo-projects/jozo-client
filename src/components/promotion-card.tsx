"use client";

import Link from "next/link";
import Image from "next/image";
import Typography from "./ui/typography";
import { Promotion } from "@/types/promotion";

export default function PromotionCard({
  promotion,
}: {
  promotion: Promotion;
}) {
  // Format ngày đăng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Link href={`/promotions/${promotion.slug}`} className="block h-full">
      <div className="glass-surface group overflow-hidden rounded-2xl h-full flex flex-col transition-transform duration-300 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={promotion.image}
            alt={promotion.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 82vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Badge: chương comeback làm nổi bật Hot */}
          <div
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold shadow ${
              promotion.slug === "dang-ky-thanh-vien" ||
              promotion.slug === "jozo-comeback-tang-2-gio"
                ? "bg-primary text-primary-foreground"
                : "glass-control text-primary"
            }`}
          >
            {promotion.slug === "dang-ky-thanh-vien"
              ? "Thành viên"
              : promotion.slug === "jozo-comeback-tang-2-gio"
                ? "Hot"
                : "Khuyến mãi"}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <Typography
            as="h3"
            variant="semibold"
            className="mb-2 text-primary line-clamp-2 group-hover:text-brand-hover transition-colors"
          >
            {promotion.title}
          </Typography>

          <Typography
            as="p"
            variant="default"
            className="text-primary/70 mb-4 line-clamp-2 text-sm"
          >
            {promotion.shortDescription}
          </Typography>

          {/* Ngày đăng (không dùng icon) */}
          <div className="text-sm text-primary/55 mt-auto">Ngày đăng: {formatDate(promotion.postedAt)}</div>
        </div>
      </div>
    </Link>
  );
}

