"use client";

import { Check, Copy, Download } from "lucide-react";
import Link from "next/link";

interface BookingSuccessModalProps {
  isOpen: boolean;
  bookingDetails: {
    name: string;
    phone: string;
    date: string;
    time: string;
    roomType: string;
  };
  bookingId: string;
  bookingCode: string;
  onCopyCode: () => void;
  onDownloadTicket: () => void;
}

export default function BookingSuccessModal({
  isOpen,
  bookingDetails,
  bookingId,
  bookingCode,
  onCopyCode,
  onDownloadTicket,
}: BookingSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary/40">
      <div className="glass-overlay relative mx-4 w-full max-w-md rounded-2xl p-6">
        {/* Action buttons in top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onDownloadTicket}
            className="rounded-xl bg-primary p-2 text-primary-foreground transition-colors hover:bg-brand-hover"
            title="Tải vé"
          >
          <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Check className="text-primary-foreground w-8 h-8" />
        </div>

        <h2 className="page-title mb-4 text-center">
          Đặt box thành công!
        </h2>

        <div className="mb-6 border-2 border-dashed border-primary/40 rounded-lg p-4 bg-primary/5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-primary">Mã đặt box:</span>
            <div className="flex items-center">
              <span className="font-mono text-lg font-bold tracking-wider text-primary mr-2">
                {bookingCode}
              </span>
              <button
                onClick={onCopyCode}
                className="text-primary hover:text-red-900"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-primary/55 italic mb-3">
            Vui lòng lưu lại mã đặt box để tra cứu sau này
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-primary/70">Tên khách hàng:</span>
              <span className="font-medium text-primary">
                {bookingDetails.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Số điện thoại:</span>
              <span className="font-medium text-primary">
                {bookingDetails.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Loại box:</span>
              <span className="font-medium text-primary">
                {bookingDetails.roomType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Ngày đặt:</span>
              <span className="font-medium text-primary">
                {bookingDetails.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Thời gian:</span>
              <span className="font-medium text-primary">
                {bookingDetails.time}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-primary/70 mb-6">
          Yay! Đặt box thành công rồi nè! 🎉 Hẹn gặp khách iu đúng giờ để cùng
          quẩy tung nóc nha! ✨
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href={`/search-songs/${bookingId}`}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-brand-hover transition-colors animate-buttonheartbeat font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            Tìm kiếm & chọn bài
          </Link>
          <Link
            href="/booking-search"
            className="w-full py-3 glass-control text-center text-foreground rounded-lg"
          >
            Tra cứu đặt box
          </Link>
        </div>
      </div>
    </div>
  );
}
