import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Không tìm thấy trang - Jozo Music Box",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4 animate-bounce">
            404
          </h1>
          <div className="text-6xl mb-4">🎤</div>
        </div>

        {/* Error Message */}
        <div className="glass-surface mb-8 rounded-3xl p-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Oops! Trang không tồn tại
          </h2>
          <p className="text-lg text-primary/70 mb-6">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Có thể bạn đã
            nhập sai địa chỉ hoặc link đã hết hạn.
          </p>

          {/* Quick Links */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-primary to-red-700 text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:from-red-800 hover:to-brand-hover transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🏠 Về trang chủ
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Link
                href="/medium"
                className="glass-control text-primary font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Đặt S-Box (1-5 người)
              </Link>
              <Link
                href="/large"
                className="glass-control text-primary font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Đặt L-Box
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-primary/70">
          <p className="mb-2">Cần hỗ trợ? Liên hệ với chúng tôi:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:0359660934"
              className="flex items-center gap-2 text-primary hover:text-brand-hover font-semibold"
            >
              📞 035 966 0934
            </a>
            <a
              href="mailto:jozostudiollc@gmail.com"
              className="flex items-center gap-2 text-primary hover:text-brand-hover font-semibold"
            >
              📧 jozostudiollc@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
