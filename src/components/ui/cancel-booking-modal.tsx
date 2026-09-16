"use client";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
  bookingDetails?: {
    name: string;
    phone: string;
    date: string;
    time: string;
  } | null;
  bookingCode?: string;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  isCancelling,
  bookingDetails,
  bookingCode,
}: CancelBookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary/40">
      <div className="glass-overlay relative mx-4 w-full max-w-md rounded-2xl p-6">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">Xác nhận hủy</h2>

          <p className="text-primary/70 mb-6">
            Bạn có chắc chắn muốn hủy box này không? Hành động này không thể
            hoàn tác.
          </p>

          {bookingDetails && (
            <div className="bg-primary/6 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-2">Thông tin:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary/70">Mã đặt box:</span>
                  <span className="font-medium">{bookingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/70">Tên:</span>
                  <span className="font-medium">{bookingDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/70">SĐT:</span>
                  <span className="font-medium">{bookingDetails.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/70">Ngày:</span>
                  <span className="font-medium">{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/70">Thời gian:</span>
                  <span className="font-medium">{bookingDetails.time}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-primary/18 rounded-lg text-primary/80 hover:bg-primary/8 transition-colors"
              disabled={isCancelling}
            >
              Không hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isCancelling}
              className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
