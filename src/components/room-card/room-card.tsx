"use client";

import Link from "next/link";
import Typography from "../ui/typography";
import { RoomType } from "@/types/room";
import { Calendar, Users } from "lucide-react";
import RoomImageCarousel from "./images-list";

/** Nhãn loại hiển thị nổi bật (badge + overlay ảnh) */
const TYPE_BADGE: Record<string, string> = {
  small: "S-Box",
  medium: "S-Box",
  large: "L-Box",
  dorm: "Dorm",
};

const BADGE_CLASS: Record<string, string> = {
  small:
    "bg-red-50 text-primary ring-1 ring-red-200/90 font-semibold tracking-tight",
  medium:
    "bg-primary/8 text-primary ring-1 ring-primary/20 font-semibold tracking-tight",
  large:
    "bg-primary/12 text-primary ring-1 ring-primary/25 font-semibold tracking-tight",
  dorm: "bg-primary/10 text-primary ring-1 ring-primary/25 font-semibold tracking-tight",
};

// Mapping số người / mô tả khu (dòng phụ dưới badge)
const CAPACITY_MAPPING: Record<string, string> = {
  small: "1-5 người · box",
  medium: "1-5 người · box",
  large: "6-8 người · box",
  dorm: "Nintendo Switch · dorm (Khu chung)",
};

export default function RoomCard({
  room,
  minPrice,
}: {
  room: RoomType;
  minPrice: number;
}) {
  // Chuyển đổi room type từ format cũ sang mới để tạo href
  const bookingUrl = `/${room.type}`;

  const typeBadge = TYPE_BADGE[room.type] || "Box";
  const badgeClass = BADGE_CLASS[room.type] ?? BADGE_CLASS.small;
  const capacityText = CAPACITY_MAPPING[room.type] || "Phòng riêng · xem mô tả";

  // Sử dụng minPrice từ props
  const displayPrice = minPrice || 0;

  return (
    <div className="glass-surface group rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-0.5">
      {/* Carousel — không bọc Link để vuốt/chuyển ảnh không bị navigate */}
      <div className="relative z-10">
        <RoomImageCarousel
          images={room.images || []}
          roomName={room.roomName || "Room"}
          roomType={typeBadge}
          fallbackImageKey={room.type}
        />
      </div>

      {/* Phần còn lại của card — click anywhere để đi tới trang đặt box */}
      <Link href={bookingUrl} className="block p-4 sm:p-5">
        <div className="mb-2">
          <span
            className={`glass-control inline-block text-xs px-2.5 py-1 rounded-full ${badgeClass}`}
          >
            {typeBadge}
          </span>
        </div>
        <Typography as="h4" variant="semibold" className="mb-2 text-primary">
          {room.roomName}
        </Typography>

        <div className="flex items-start gap-2 mb-3">
          <Users className="w-4 h-4 mt-0.5 shrink-0 text-primary/50" />
          <span className="text-xs text-primary/70 leading-snug">
            {capacityText}
          </span>
        </div>

        <div className="mb-4">
          {displayPrice > 0 ? (
            <Typography as="p" variant="bold" className="text-primary text-lg">
              Chỉ từ: {displayPrice.toLocaleString("vi-VN")}đ/giờ
            </Typography>
          ) : (
            <div className="text-center py-4">
              <Typography as="p" variant="bold" className="text-primary">
                Liên hệ để biết giá
              </Typography>
            </div>
          )}
        </div>

        <span className="glass-control w-full border-primary/20 bg-primary/80 text-primary-foreground hover:bg-primary font-medium py-2 px-4 rounded-full transition-colors animate-buttonheartbeat flex items-center justify-center">
          <Calendar className="w-4 h-4 mr-2" />
          Đặt ngay
        </span>
      </Link>
    </div>
  );
}
