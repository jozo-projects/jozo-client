import { getRoomDataByType } from "@/lib/data-cache";
import BookingForm from "@/components/booking-form";
import RoomImageGallery from "@/components/room-image-gallery";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Price } from "@/types/price";

type RoomType = "Small" | "Medium" | "Large" | "Dorm";

// Thêm generateStaticParams để chỉ generate các route loại phòng hợp lệ
export async function generateStaticParams() {
  return [
    { type: "small" },
    { type: "medium" },
    { type: "large" },
    { type: "dorm" },
  ];
}

// Chặn dynamic params không có trong generateStaticParams
export const dynamicParams = false;

// Room type mapping from URL params
const ROOM_TYPE_MAPPING: Record<string, RoomType> = {
  small: "Medium",
  medium: "Medium",
  large: "Large",
  dorm: "Dorm",
};

// Room type labels for SEO
const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  Small: "S-Box (1-5 người)",
  Medium: "S-Box (1-5 người)",
  Large: "L-Box (6-8 người)",
  Dorm: "Dorm Nintendo Switch",
};

const ROOM_TYPE_SEO: Record<
  RoomType,
  { description: string; keywords: string }
> = {
  Small: {
    description:
      "Đặt S-Box riêng tư tại JOZO Biên Hòa — 1–5 người. Theo dõi thời gian, order đồ ăn trên tablet, thành viên. Giá all-in-one: không thuế, không phí dịch vụ.",
    keywords: "music box biên hòa, s-box, box riêng tư, không thuế phí dịch vụ",
  },
  Medium: {
    description:
      "Đặt S-Box riêng tư tại JOZO Biên Hòa — 1–5 người. Theo dõi thời gian, order đồ ăn trên tablet, thành viên. Giá all-in-one: không thuế, không phí dịch vụ.",
    keywords: "music box biên hòa, s-box, box riêng tư, không thuế phí dịch vụ",
  },
  Large: {
    description:
      "Đặt L-Box riêng tư tại JOZO Biên Hòa — 6–8 người, 4 mic sẵn. Order trên tablet, theo dõi thời gian. Giá minh bạch — không thuế, không phí dịch vụ.",
    keywords: "music box biên hòa, l-box, box riêng tư, không thuế phí dịch vụ",
  },
  Dorm: {
    description:
      "Khu Dorm Nintendo Switch tại JOZO Biên Hòa — chơi game chung, theo dõi thời gian sử dụng. Giá minh bạch, không thuế hay phí dịch vụ phát sinh.",
    keywords: "nintendo switch biên hòa, dorm jozo, không thuế phí dịch vụ",
  },
};

interface BookingPageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({
  params,
}: BookingPageProps): Promise<Metadata> {
  const { type } = await params;
  const roomType = ROOM_TYPE_MAPPING[type];

  if (!roomType) {
    return {
      title: "Không tìm thấy loại box",
    };
  }

  const roomLabel = ROOM_TYPE_LABELS[roomType];
  const seo = ROOM_TYPE_SEO[roomType];

  return {
    title: `Đặt ${roomLabel} - JOZO Biên Hòa`,
    description: seo.description,
    keywords: seo.keywords,
  };
}

/** Fallback khi API không khả dụng (ví dụ lúc build Docker). */
const FALLBACK_PRICES: Price[] = [];

async function getPrices(): Promise<Price[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    return FALLBACK_PRICES;
  }
  try {
    const response = await fetch(`${baseUrl}/api/price`, {
      next: { revalidate: 300 },
    });
    const text = await response.text();
    // Tránh parse HTML (trang lỗi) thành JSON — build sẽ không crash
    if (!response.ok || !text.trim().startsWith("{")) {
      return FALLBACK_PRICES;
    }
    const data = JSON.parse(text) as { data?: Price[] };
    return Array.isArray(data?.data) ? data.data : FALLBACK_PRICES;
  } catch {
    return FALLBACK_PRICES;
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { type } = await params;

  if (type === "small") {
    redirect("/medium");
  }

  const prices = await getPrices();

  // Validate room type
  const roomType = ROOM_TYPE_MAPPING[type];

  if (!roomType) {
    notFound();
  }

  // Fetch room data and prices from server
  const roomData = await getRoomDataByType(roomType);

  if (!roomData) {
    notFound();
  }

  // Lấy danh sách ảnh từ API (lấy từ box đầu tiên của loại box này)
  const roomImages =
    roomData.rooms && roomData.rooms.length > 0 && roomData.rooms[0].images
      ? roomData.rooms[0].images
      : [];
  const isLargeRoom = roomType === "Large";
  const isDorm = roomType === "Dorm";

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Room Images Gallery */}
      <RoomImageGallery
        images={roomImages}
        roomLabel={ROOM_TYPE_LABELS[roomType]}
      />

      {isLargeRoom && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-accent/50 px-4 py-3 text-sm font-semibold text-primary shadow-sm">
          L-Box được trang bị sẵn 4 mic — thoải mái song ca cùng nhóm đông.
        </div>
      )}

      {isDorm && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-accent/50 px-4 py-3 text-sm font-semibold text-primary shadow-sm">
          Khu Dorm — chơi Nintendo Switch chung, không phải phòng box riêng.
          Tính giờ theo bảng giá bên dưới.
        </div>
      )}

      <BookingForm roomType={roomType} prices={prices} />
    </div>
  );
}
