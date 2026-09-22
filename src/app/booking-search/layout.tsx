import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra cứu đặt box - Jozo Music Box",
  description:
    "Tra cứu đặt box tại Jozo: xem thời gian sử dụng và thông tin minh bạch bằng số điện thoại — không thuế, không phí dịch vụ phát sinh.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function BookingSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
