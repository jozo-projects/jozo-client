"use client";

import { Check, Copy, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookingEvent from "@/components/booking-event";
import { EventBooking } from "@/lib/event-booking";
import { getBookingProof, POST_BOOKING_EVENT_SAVE_ENABLED, saveBookingEvent } from "@/lib/post-booking-event";
import { getApiUrl } from "@/lib/api-utils";

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
  const [showEventPreview, setShowEventPreview] = useState(false);
  const [event, setEvent] = useState<EventBooking | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventMessage, setEventMessage] = useState("");
  async function saveEvent() {
    if (!event || savingEvent) return;
    setSavingEvent(true);
    setEventMessage("");
    try {
      const proof = getBookingProof(window.sessionStorage, bookingId);
      if (!proof) throw new Error("Không tìm thấy quyền chỉnh sửa trong phiên này.");
      await saveBookingEvent(bookingId, proof, event, fetch, getApiUrl().replace(/\/$/, ""));
      setEventMessage("Đã lưu sự kiện.");
    } catch (error) {
      setEventMessage(error instanceof Error ? error.message : "Không thể lưu sự kiện.");
    } finally { setSavingEvent(false); }
  }
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50">
      <div className={`relative w-full overflow-y-auto ${showEventPreview
        ? "glass-overlay h-[100dvh] px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:mx-4 sm:h-auto sm:max-h-[90dvh] sm:max-w-4xl sm:rounded-2xl sm:p-8"
        : "mx-4 max-h-[90dvh] max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8"}`}>
        {showEventPreview ? (
          <div>
            <h2 className="page-title text-center">Xem thử trang trí sự kiện <span className="text-sm font-medium">Beta</span></h2>
            <p className="mt-3 text-sm text-foreground">Đây là bản xem thử. Ảnh và nhạc chưa được lưu vào đơn đặt box hoặc gửi đến TV.</p>
            <BookingEvent event={event} onChange={setEvent} />
            {POST_BOOKING_EVENT_SAVE_ENABLED && event && <label className="mb-3 flex gap-2 text-sm"><input type="checkbox" checked={event.consent} onChange={(e) => setEvent({ ...event, consent: e.target.checked })} />Đồng ý sử dụng ảnh cho sự kiện này.</label>}
            <p className="mb-3 text-sm">Chức năng lưu ảnh và nhạc hiện chưa khả dụng; bản xem thử sẽ không được lưu.</p>
            <button type="button" disabled={!POST_BOOKING_EVENT_SAVE_ENABLED || savingEvent || !!event?.preparing} onClick={saveEvent} className="glass-control mb-2 w-full rounded-lg py-3 text-foreground disabled:opacity-50">{savingEvent ? "Đang lưu..." : "Lưu sự kiện (chưa khả dụng)"}</button>
            {eventMessage && <p role="status" className="mb-3 text-sm">{eventMessage}</p>}
            <button type="button" onClick={() => { setShowEventPreview(false); setEvent(null); }} className="glass-control w-full rounded-lg py-3 text-foreground">Quay lại thông tin đặt box</button>
          </div>
        ) : (<>
        {/* Action buttons in top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onDownloadTicket}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Tải vé"
            aria-label="Tải vé"
          >
          <Download className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Check className="h-7 w-7 text-emerald-700" />
        </div>

        <h2 className="mb-2 text-center text-xl font-bold tracking-tight text-slate-900">
          Đặt box thành công!
        </h2>
        <p className="mb-6 text-center text-sm text-slate-600">
          Cảm ơn khách iu đã đặt box. Hẹn gặp khách iu đúng giờ nhé!
        </p>

        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700">Mã đặt box</span>
            <div className="flex items-center">
              <span className="mr-2 font-mono text-lg font-bold tracking-wider text-slate-900">
                {bookingCode}
              </span>
              <button
                onClick={onCopyCode}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                aria-label="Sao chép mã đặt box"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="mb-4 text-xs text-slate-600">
            Vui lòng lưu lại mã đặt box để tra cứu sau này
          </p>

          <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Tên khách hàng:</span>
              <span className="font-medium text-slate-900">
                {bookingDetails.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Số điện thoại:</span>
              <span className="font-medium text-slate-900">
                {bookingDetails.phone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Loại box:</span>
              <span className="font-medium text-slate-900">
                {bookingDetails.roomType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ngày đặt:</span>
              <span className="font-medium text-slate-900">
                {bookingDetails.date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Thời gian:</span>
              <span className="font-medium text-slate-900">
                {bookingDetails.time}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-sm text-slate-600">
            <span>Ảnh &amp; nhạc cho sự kiện</span>{" "}
            <span>· Sắp ra mắt</span>
          </div>
          <Link
            href={`/search-songs/${bookingId}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 font-medium text-white transition-colors hover:bg-slate-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            Tìm kiếm & chọn bài
          </Link>
          <Link
            href="/booking-search"
            className="w-full rounded-lg border border-slate-200 py-3 text-center font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Tra cứu đặt box
          </Link>
        </div>
        </>)}
      </div>
    </div>
  );
}
