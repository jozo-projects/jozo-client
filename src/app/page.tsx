import type { Metadata } from "next";
import { Suspense } from "react";
import TestimonialCarousel from "@/components/carousel";
import HomeRoomSection from "@/components/home-room-section";
import PromotionSection from "@/components/promotion-section";
import FloatingContactButtons from "@/components/floating-contact-buttons";
import { promotions } from "@/data/promotions";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "JOZO Music Box Biên Hòa | Box riêng tư all-in-one",
  description:
    "Đặt box riêng tư tại JOZO Biên Hòa: theo dõi thời gian sử dụng, thành viên, order đồ ăn trên tablet. Giá minh bạch — không thuế, không phí dịch vụ phát sinh.",
  keywords: [
    "jozo",
    "music box",
    "music box biên hòa",
    "box riêng tư",
    "box riêng tư biên hòa",
    "đặt phòng music box",
    "thành viên jozo",
    "order đồ ăn tablet",
    "không thuế không phí dịch vụ",
    "all in one biên hòa",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "JOZO Music Box Biên Hòa | Box riêng tư all-in-one",
    description:
      "Box riêng tư all-in-one tại JOZO Biên Hòa: theo dõi thời gian, thành viên, order trên tablet. Minh bạch — không thuế, không phí dịch vụ.",
    url: "/",
    images: ["/images/member-poster-final.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JOZO Music Box Biên Hòa | Box riêng tư all-in-one",
    description:
      "Box riêng tư all-in-one: theo dõi thời gian, thành viên, order trên tablet. Không thuế, không phí dịch vụ phát sinh.",
    images: ["/images/member-poster-final.webp"],
  },
};

function RoomSectionSkeleton() {
  return (
    <section className="mb-10 animate-pulse rounded-2xl border border-border bg-gradient-to-b from-card to-muted/60 p-5 shadow-sm sm:mb-16 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-muted/80 aspect-[4/3]" />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <div className="w-full">
        <TestimonialCarousel />
        <PromotionSection promotions={promotions} />

        <Suspense fallback={<RoomSectionSkeleton />}>
          <HomeRoomSection />
        </Suspense>
      </div>
      <FloatingContactButtons />
    </>
  );
}
