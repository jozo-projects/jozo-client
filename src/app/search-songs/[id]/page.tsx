import SearchSongsClient from "@/components/search-songs-client";
import { getBookingDetails } from "@/lib/data-cache";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

// Ngăn không cho Google index các trang search-songs
export const metadata: Metadata = {
  title: "Chọn nhạc - Jozo Music Box",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <-- await params trước

  // SSR fetch booking details với room schedule ID
  // Sử dụng cached function để deduplicate requests
  const initialBookingDetails = await getBookingDetails(id);

  return (
    <SearchSongsClient
      roomScheduleId={id}
      initialBookingDetails={initialBookingDetails}
    />
  );
}
