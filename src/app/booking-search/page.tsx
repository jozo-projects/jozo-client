"use client";

import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-card";
import Input from "@/components/ui/input";
import { JozoLoaderWithText } from "@/components/ui/jozo-loader";
import { toast } from "@/hooks/use-toast";
import { cancelBooking } from "@/lib/api-utils";
import { Booking } from "@/types/booking.d";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type TabType = "all" | "booked" | "in use" | "cancelled" | "finished";

function getRoomName(roomType?: string | null): string {
  const normalizedRoomType = roomType?.trim().toLowerCase();

  if (normalizedRoomType === "small" || normalizedRoomType === "medium") {
    return "S-Box (1-5 người)";
  }

  if (normalizedRoomType === "dorm") {
    return "Dorm";
  }

  return "L-Box (6-8 người)";
}

function getBookingRoomName(
  booking: Pick<Booking, "actualRoomType" | "originalRoomType">,
): string {
  return getRoomName(booking.actualRoomType || booking.originalRoomType);
}

function BookingSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]); // Lưu tất cả bookings từ API

  // Cancel booking state
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Kiểm tra booking param từ URL khi component mount
  useEffect(() => {
    const bookingId = searchParams.get("booking");
    if (bookingId && allBookings.length > 0) {
      // Tìm booking theo _id
      const booking = allBookings.find((b) => b._id === bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setShowDetailModal(true);
      }
    }
  }, [searchParams, allBookings]);

  // Kiểm tra booking param từ URL khi chưa có dữ liệu
  useEffect(() => {
    const bookingId = searchParams.get("booking");
    if (bookingId && allBookings.length === 0 && !searched) {
      // Hiển thị thông báo để người dùng tìm kiếm trước
      setError(`Vui lòng nhập số điện thoại để xem chi tiết booking`);
    }
  }, [searchParams, allBookings.length, searched]);

  // Hàm filter bookings theo tab
  const filterBookingsByTab = (
    bookings: Booking[],
    tab: TabType,
  ): Booking[] => {
    switch (tab) {
      case "all":
        return bookings; // Hiển thị tất cả bookings
      case "booked":
        return bookings.filter((booking) => booking.status === "booked");
      case "in use":
        return bookings.filter((booking) => booking.status === "in use");
      case "cancelled":
        return bookings.filter((booking) => booking.status === "cancelled");
      case "finished":
        return bookings.filter(
          (booking) =>
            booking.status === "finished" || booking.status === "completed",
        );
      default:
        return bookings;
    }
  };

  const handleSearch = async () => {
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Chỉ truyền phone parameter vì backend chỉ yêu cầu phone là required
      const response = await fetch(
        `/api/bookings/search?phone=${encodeURIComponent(phone)}`,
      );
      const data = await response.json();

      if (data.success) {
        const allBookingsData = data.data || [];
        setAllBookings(allBookingsData);
        // Filter theo tab hiện tại
        const filteredBookings = filterBookingsByTab(
          allBookingsData,
          activeTab,
        );
        setBookings(filteredBookings);
      } else {
        setError(data.message || "Có lỗi xảy ra khi tìm kiếm");
        setBookings([]);
        setAllBookings([]);
      }
    } catch {
      setError("Lỗi kết nối server");
      setBookings([]);
      setAllBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);

    // Nếu đã tìm kiếm trước đó, chỉ filter từ dữ liệu đã có
    if (searched && allBookings.length > 0) {
      const filteredBookings = filterBookingsByTab(allBookings, tab);
      setBookings(filteredBookings);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "booked":
        return "Đã đặt";
      case "in use":
        return "Đang sử dụng";
      case "cancelled":
        return "Đã hủy";
      case "finished":
      case "completed":
        return "Hoàn thành";
      default:
        return "Chưa xác định";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "confirmed":
        return "text-green-600";
      case "booked":
        return "text-blue-600";
      case "in use":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      case "finished":
      case "completed":
        return "text-purple-600";
      default:
        return "text-primary/70";
    }
  };

  const getBookingCode = (booking?: Booking) => {
    if (!booking) return "N/A";
    // Sử dụng bookingCode từ API nếu có, fallback về _id nếu không có
    return (
      booking.bookingCode ||
      booking._id?.toString().slice(0, 6).toUpperCase() ||
      "N/A"
    );
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);

    // Thêm booking _id vào URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set("booking", booking._id || "");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);

    // Xóa booking param khỏi URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("booking");
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!bookingToCancel || !bookingToCancel._id) return;

    setIsCancelling(true);

    try {
      const result = await cancelBooking(bookingToCancel._id, phone);

      if (result.success) {
        toast({
          title: "Hủy booking thành công!",
          description: "Booking đã được hủy thành công.",
        });

        // Cập nhật trạng thái booking trong danh sách
        const updatedBookings = allBookings.map((booking) =>
          booking._id === bookingToCancel._id
            ? { ...booking, status: "cancelled" as const }
            : booking,
        );

        setAllBookings(updatedBookings);

        // Filter lại theo tab hiện tại
        const filteredBookings = filterBookingsByTab(
          updatedBookings,
          activeTab,
        );
        setBookings(filteredBookings);

        // Đóng modal
        setShowCancelModal(false);
        setBookingToCancel(null);

        // Đóng detail modal nếu đang mở
        if (selectedBooking && selectedBooking._id === bookingToCancel._id) {
          setShowDetailModal(false);
          setSelectedBooking(null);
        }
      } else {
        toast({
          title: "Hủy booking thất bại!",
          description: result.message || "Có lỗi xảy ra khi hủy booking.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Hủy booking thất bại!",
        description: "Có lỗi xảy ra khi hủy booking. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Open cancel confirmation modal
  const openCancelModal = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="mx-auto w-full max-w-3xl py-2">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="page-title">
            Tra cứu đặt box
          </h1>
          <p className="page-lede mx-auto max-w-2xl">
            Nhập số điện thoại để tra cứu thông tin đặt box
          </p>
        </div>

        {/* Search Form */}
        <FormCard className="mb-8">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại (VD: 0912345678)"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
                  if (value.length <= 10) {
                    setPhone(value);
                  }
                }}
                maxLength={10}
                className="h-11 flex-1 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              type="button"
              className="flex h-11 items-center gap-2 rounded-xl px-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang tìm...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Tìm kiếm
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <svg
                className="h-5 w-5 shrink-0 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium text-red-300">{error}</p>
            </div>
          )}
        </FormCard>

        {/* Tabs */}
        {searched && (
          <FormCard className="overflow-hidden p-0">
            <div className="bg-gradient-to-r from-muted/50 to-background px-4 sm:px-6 lg:px-8 py-2">
              <nav className="flex gap-1 sm:gap-2 lg:gap-1 overflow-x-auto scrollbar-hide">
                {[
                  { key: "all", label: "Tất cả" },
                  { key: "booked", label: "Đã đặt" },
                  { key: "in use", label: "Đang sử dụng" },
                  { key: "finished", label: "Hoàn thành" },
                  { key: "cancelled", label: "Đã hủy" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key as TabType)}
                    className={`relative flex-shrink-0 py-3 px-2 sm:py-4 sm:px-4 lg:px-6 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                      activeTab === tab.key
                        ? "glass-control text-foreground"
                        : "text-foreground/75 hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1 sm:gap-2">
                      {tab.label}
                    </span>
                    {activeTab === tab.key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-red-600/10 rounded-xl"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Results */}
            <div className="p-4">
              {loading ? (
                <div className="text-center py-16">
                  <JozoLoaderWithText
                    text="Đang tải dữ liệu..."
                    size="lg"
                    className="text-lg"
                  />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/8 rounded-full mb-6">
                    <svg
                      className="w-10 h-10 text-primary/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-primary/80 mb-2">
                    Không tìm thấy đặt box
                  </h3>
                  <p className="text-primary/55 max-w-md mx-auto">
                    Không có đặt box nào được tìm thấy với số điện thoại này.
                    Vui lòng kiểm tra lại số điện thoại.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Kết quả tìm kiếm
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {bookings.map((booking, index) => (
                      <div
                        key={booking._id}
                        onClick={() => handleBookingClick(booking)}
                        className="group bg-gradient-to-r from-white to-primary/5 border border-primary/12 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Header - Status & Action Buttons */}
                        <div className="bg-gradient-to-r from-muted/40 to-white px-6 py-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <p
                              className={`text-lg font-bold ${getStatusColor(
                                booking.status,
                              )}`}
                            >
                              {getStatusText(booking.status)}
                            </p>
                            <span className="bg-gradient-to-r from-primary to-red-700 text-primary-foreground px-3 py-1 rounded-lg text-sm font-semibold">
                              #{getBookingCode(booking)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {booking.status === "booked" && (
                            <div className="flex gap-2 flex-wrap">
                              <Link
                                href={`/search-songs/${booking._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gradient-to-r from-primary to-red-700 text-primary-foreground px-4 py-2 rounded-lg hover:from-red-800 hover:to-brand-hover transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-md text-sm font-medium"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                  />
                                </svg>
                                Tìm video
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCancelModal(booking);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-md text-sm font-medium"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Hủy box
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Content - Customer Info & Booking Details */}
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Info */}
                            <div className="space-y-3">
                              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {booking.customerName}
                              </h3>
                              <div className="space-y-2">
                                <p className="text-sm text-primary/70 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-primary flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  {booking.customerPhone}
                                </p>
                                {booking.customerEmail && (
                                  <p className="text-sm text-primary/70 flex items-center gap-2 break-all">
                                    <svg
                                      className="w-4 h-4 text-primary flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {booking.customerEmail}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-3">
                              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <svg
                                  className="w-5 h-5 text-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                                {getBookingRoomName(booking)}
                              </h3>
                              <div className="space-y-2">
                                <p className="text-sm text-primary/70 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-blue-500 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="font-medium">Ngày đặt:</span>
                                  {formatDateTime(booking.createdAt || "")}
                                </p>
                                <p className="text-sm text-primary/70 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-green-500 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="font-medium">Bắt đầu:</span>
                                  {formatDateTime(booking.startTime)}
                                </p>
                                <p className="text-sm text-primary/70 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-red-500 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="font-medium">Kết thúc:</span>
                                  {formatDateTime(booking.endTime)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormCard>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-primary/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-overlay rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-red-700 text-primary-foreground p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Chi tiết đặt box</h2>
                  <p className="text-red-100 mt-1">
                    Mã đặt box: #{getBookingCode(selectedBooking)}
                  </p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-full"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-primary/6 rounded-2xl p-4">
                <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Thông tin khách hàng
                </h3>
                <div className="space-y-2">
                  <p className="text-primary/80">
                    <span className="font-medium">Tên:</span>{" "}
                    {selectedBooking.customerName}
                  </p>
                  <p className="text-primary/80">
                    <span className="font-medium">SĐT:</span>{" "}
                    {selectedBooking.customerPhone}
                  </p>
                  {selectedBooking.customerEmail && (
                    <p className="text-primary/80">
                      <span className="font-medium">Email:</span>{" "}
                      {selectedBooking.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-primary/6 rounded-2xl p-4">
                <h3 className="font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Thông tin đặt box
                </h3>
                <div className="space-y-2">
                  <p className="text-primary/80">
                    <span className="font-medium">Loại box:</span>{" "}
                    {getBookingRoomName(selectedBooking)}
                  </p>
                  <p className="text-primary/80">
                    <span className="font-medium">Ngày đặt:</span>{" "}
                    {formatDateTime(selectedBooking.createdAt || "")}
                  </p>
                  <p className="text-primary/80">
                    <span className="font-medium">Thời gian bắt đầu:</span>{" "}
                    {formatDateTime(selectedBooking.startTime)}
                  </p>
                  <p className="text-primary/80">
                    <span className="font-medium">Thời gian kết thúc:</span>{" "}
                    {formatDateTime(selectedBooking.endTime)}
                  </p>
                  <p className="text-primary/80">
                    <span className="font-medium">Trạng thái:</span>
                    <span
                      className={`ml-2 font-semibold ${getStatusColor(
                        selectedBooking.status,
                      )}`}
                    >
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-primary/6 px-6 py-4 rounded-b-3xl">
              <div className="flex gap-3">
                {selectedBooking.status === "booked" && (
                  <>
                    <Link
                      href={`/search-songs/${selectedBooking._id}`}
                      className="flex-1 bg-gradient-to-r from-primary to-red-700 hover:from-red-800 hover:to-brand-hover text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                      Tìm video
                    </Link>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openCancelModal(selectedBooking);
                      }}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Hủy đặt box
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-primary/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-overlay rounded-3xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Xác nhận hủy</h2>
                  <p className="text-red-100 mt-1">
                    Mã đặt box: #{getBookingCode(bookingToCancel)}
                  </p>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-full"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Bạn có chắc chắn muốn hủy box này?
                </h3>

                <p className="text-primary/70 mb-6">
                  Hành động này không thể hoàn tác. Trạng thái đặt sẽ được hủy
                  và không thể thể khôi phục.
                </p>

                {/* Booking Info */}
                <div className="bg-primary/6 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-foreground mb-3">
                    Thông tin:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary/70">Tên khách hàng:</span>
                      <span className="font-medium text-primary">
                        {bookingToCancel.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary/70">Số điện thoại:</span>
                      <span className="font-medium text-primary">
                        {bookingToCancel.customerPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary/70">Loại box:</span>
                      <span className="font-medium text-primary">
                        {getRoomName(
                          bookingToCancel.originalRoomType ||
                            bookingToCancel.actualRoomType,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary/70">Thời gian:</span>
                      <span className="font-medium text-primary">
                        {formatDateTime(bookingToCancel.startTime)} -{" "}
                        {formatDateTime(bookingToCancel.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary/70">Trạng thái:</span>
                      <span
                        className={`font-semibold ${getStatusColor(
                          bookingToCancel.status,
                        )}`}
                      >
                        {getStatusText(bookingToCancel.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 px-4 border border-primary/18 rounded-xl text-primary/80 hover:bg-primary/8 transition-colors font-medium"
                  disabled={isCancelling}
                >
                  Không hủy
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang hủy...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Xác nhận hủy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <JozoLoaderWithText
            text="Đang tải trang..."
            size="lg"
            className="text-lg"
          />
        </div>
      }
    >
      <BookingSearchContent />
    </Suspense>
  );
}
