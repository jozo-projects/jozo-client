import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký thành viên - Jozo Music Box",
  description:
    "Đăng ký thành viên Jozo: theo dõi thời gian sử dụng, nhận ưu đãi minh bạch — không thuế, không phí dịch vụ phát sinh.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
