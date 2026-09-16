"use client";

import { DateSelect } from "@/components/ui/date-select";
import { formCardClassName } from "@/components/ui/form-card";
import Input from "@/components/ui/input";
import CancelBookingModal from "@/components/ui/cancel-booking-modal";
import BookingSuccessModal from "@/components/ui/booking-success-modal";
import { useTicketActions } from "@/hooks/use-ticket-actions";
import { toast } from "@/hooks/use-toast";
import { cancelBooking, createApiEndpoint } from "@/lib/api-utils";
import {
  BookingFormData,
  BookingFormValues,
  bookingSchema,
} from "@/schemas/booking.schema";
import { BookingRequest } from "@/types/booking.d";
import { Price } from "@/types/price";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Phone, User, ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type RoomType = "Small" | "Medium" | "Large" | "Dorm";

type HolidayItem = {
  date: string;
  name: string;
  description: string | null;
};

const sameDay = (d1: Date, d2: Date): boolean =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

// Mùng 1 Tết 2026 - Jozo nghỉ, không nhận đặt
const TET_DAY_OFF = new Date(2026, 1, 17); // 17/2/2026
const isTetDay1Off = (date: Date | null): boolean =>
  !!date && sameDay(date, TET_DAY_OFF);

// 30 Tết 16/2/2026 - 9h quán đóng để dọn dẹp đón giao thừa; giờ kết thúc tối đa 21:00 (nếu đặt 8h thì 9h phải đóng)
const EVE_TET_2026 = new Date(2026, 1, 16); // 16/2/2026
const isEveTet2026 = (date: Date | null): boolean =>
  !!date && sameDay(date, EVE_TET_2026);
const EVE_TET_CLOSE_MINUTES = 21 * 60; // 21:00 = 9h tối
const DEFAULT_CLOSE_MINUTES = 24 * 60; // 24:00 = 0h hôm sau

// Từ 18/2/2026 trở đi: cho phép đặt đến 23h
const EXTENDED_HOURS_FROM = new Date(2026, 1, 18);
const isExtendedHoursDate = (date: Date | null): boolean =>
  !!date && (date > EXTENDED_HOURS_FROM || sameDay(date, EXTENDED_HOURS_FROM));

// Constants và utility functions
const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  Small: "S-Box (1-5 người)",
  Medium: "S-Box (1-5 người)",
  Large: "L-Box (6-8 người)",
  Dorm: "Dorm",
};

// Generate time slots function
const generateTimeSlots = (
  startHour: number,
  endHour: number,
  intervalMinutes: number = 30,
): string[] => {
  const times: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break; // Dừng ở endHour:00

      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      times.push(timeString);
    }
  }

  return times;
};

// Generate all time slots from 09:00 đến 23:00 (slot cuối cùng là 23:00)
const ALL_START_TIMES = generateTimeSlots(9, 23, 30).filter((time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour < 23 || (hour === 23 && minute === 0);
});

type BookingActivityType = "nintendo-switch" | "music-box";

const ACTIVITY_OPTIONS: { value: BookingActivityType; label: string }[] = [
  { value: "music-box", label: "Music Box" },
  { value: "nintendo-switch", label: "Chơi game Nintendo Switch" },
];

const ACTIVITY_NOTE_PREFIX: Record<BookingActivityType, string> = {
  "nintendo-switch": "Nintendo Switch",
  "music-box": "Music Box",
};

function buildBookingNote(
  activityType: BookingActivityType,
  userNote: string | undefined,
): string | undefined {
  const trimmed = (userNote ?? "").trim();
  const tag = ACTIVITY_NOTE_PREFIX[activityType];
  if (!trimmed) {
    return `[${tag}]`;
  }
  return `[${tag}] ${trimmed}`;
}

const DURATION_OPTIONS = [
  { value: 1, label: "1 giờ" },
  { value: 1.5, label: "1.5 giờ" },
  { value: 2, label: "2 giờ" },
  { value: 2.5, label: "2.5 giờ" },
  { value: 3, label: "3 giờ" },
  { value: 3.5, label: "3.5 giờ" },
  { value: 4, label: "4 giờ" },
];

// Utility functions
const getAvailableStartTimes = (selectedDate: Date): string[] => {
  let baseTimes = ALL_START_TIMES;

  // 30 Tết 16/2: chỉ cho đặt đến 8h tối (giờ bắt đầu tối đa 20:00), 9h quán đóng
  if (isEveTet2026(selectedDate)) {
    baseTimes = baseTimes.filter((time) => {
      const [hour, minute] = time.split(":").map(Number);
      return hour * 60 + minute <= 20 * 60; // 20:00 = 8h tối, 20:00 + 1h = 21:00 (9h đóng)
    });
  } else if (!isExtendedHoursDate(selectedDate)) {
    // Trước 18/2: giới hạn kết thúc 22:00 (giờ bắt đầu tối đa 21:00)
    baseTimes = baseTimes.filter((time) => {
      const [hour, minute] = time.split(":").map(Number);
      return hour * 60 + minute <= 21 * 60;
    });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  if (selectedDay.getTime() !== today.getTime()) {
    return baseTimes;
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const minTimeInMinutes = currentTimeInMinutes + 30;

  return baseTimes.filter((time) => {
    const [hour, minute] = time.split(":").map(Number);
    const timeInMinutes = hour * 60 + minute;
    return timeInMinutes >= minTimeInMinutes;
  });
};

const calculateEndTime = (startTime: string, duration: number): string => {
  if (!startTime) return "";

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const totalStartMinutes = startHour * 60 + startMinute;
  const totalEndMinutes = totalStartMinutes + duration * 60;

  const endHour = Math.floor(totalEndMinutes / 60);
  const endMinute = totalEndMinutes % 60;

  return `${endHour.toString().padStart(2, "0")}:${endMinute
    .toString()
    .padStart(2, "0")}`;
};

const createISOString = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);

  const offset = 7 * 60; // +07:00 in minutes
  const utc = new Date(
    dateTime.getTime() - dateTime.getTimezoneOffset() * 60000,
  );
  const localTime = new Date(utc.getTime() + offset * 60000);

  return localTime.toISOString().replace("Z", "+07:00");
};

// Price calculation function
const MINUTES_PER_DAY = 24 * 60;
const PRICE_CALC_EPSILON_HOURS = 0.0001;
const toMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const calculateEstimatedPrice = (
  selectedDate: Date | null,
  selectedStartTime: string,
  selectedDuration: number,
  roomType: RoomType,
  prices: Price[],
  holidays: HolidayItem[] = [],
): number => {
  if (
    !selectedStartTime ||
    !selectedDuration ||
    !selectedDate ||
    prices.length === 0
  ) {
    return 0;
  }

  // Xác định loại ngày: weekend (T7/CN) hoặc holiday → dùng giá weekend
  const dayOfWeek = selectedDate.getDay();
  const isHoliday = holidays.some((h) =>
    sameDay(selectedDate, new Date(h.date)),
  );
  let dayType: "weekday" | "weekend" | "holiday" = "weekday";

  if (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) {
    dayType = "weekend";
  }

  // Ưu tiên mapping chính, đồng thời fallback small/medium để tương thích dữ liệu giá cũ/mới
  const roomTypeCandidates: Record<RoomType, string[]> = {
    Small: ["medium", "small"],
    Medium: ["medium", "small"],
    Large: ["large"],
    Dorm: ["dorm"],
  };
  const roomTypeCandidateList = roomTypeCandidates[roomType];

  // Tìm price rule phù hợp
  const priceRule = prices.find((p) => p.day_type === dayType);
  if (!priceRule) return 0;

  // Tính giá theo phần giao nhau giữa interval đặt và từng time slot
  // Cách này xử lý chính xác các case giao khung, ví dụ 12:30-13:30
  const bookingStartMinutes = toMinutes(selectedStartTime);
  const bookingDurationMinutes = selectedDuration * 60;
  const bookingEndMinutes = bookingStartMinutes + bookingDurationMinutes;

  let totalPrice = 0;
  let totalCoveredMinutes = 0;
  const overlappedSlotKeys = new Set<string>();

  for (const slot of priceRule.time_slots) {
    const roomPrice = slot.prices.find((p) =>
      roomTypeCandidateList.includes(p.room_type),
    );
    if (!roomPrice) {
      continue;
    }

    const baseStart = toMinutes(slot.start);
    let baseEnd = toMinutes(slot.end);
    if (baseEnd <= baseStart) {
      baseEnd += MINUTES_PER_DAY; // Slot qua ngày, ví dụ 19:00 -> 01:00
    }

    // Thử 3 mốc ngày để bắt đúng giao nhau, kể cả khi booking qua ngày
    for (const dayShift of [-MINUTES_PER_DAY, 0, MINUTES_PER_DAY]) {
      const slotStart = baseStart + dayShift;
      const slotEnd = baseEnd + dayShift;

      const overlapStart = Math.max(bookingStartMinutes, slotStart);
      const overlapEnd = Math.min(bookingEndMinutes, slotEnd);
      const overlapMinutes = overlapEnd - overlapStart;

      if (overlapMinutes > 0) {
        totalCoveredMinutes += overlapMinutes;
        totalPrice += (overlapMinutes / 60) * roomPrice.price;
        overlappedSlotKeys.add(`${slot.start}-${slot.end}-${dayShift}`);
      }
    }
  }

  // Nếu hoàn toàn không match slot nào thì trả 0
  if (totalPrice <= 0) {
    return 0;
  }

  // Không cộng quá thời lượng đặt trong trường hợp dữ liệu slot bị overlap nhau
  const overcovered =
    totalCoveredMinutes - bookingDurationMinutes >
    PRICE_CALC_EPSILON_HOURS * 60;
  if (overcovered) {
    const normalizeRatio = bookingDurationMinutes / totalCoveredMinutes;
    totalPrice *= normalizeRatio;
  }

  // Bảng giá có thể “hở” 1 phút giữa hai slot ranh giới (vd 12:59 vs 13:01) → 13h–14h chỉ được 59 phút, thường thiếu ~1 nghìn so với 1 giờ.
  if (!overcovered) {
    const missingMinutes = bookingDurationMinutes - totalCoveredMinutes;
    if (
      missingMinutes > PRICE_CALC_EPSILON_HOURS * 60 &&
      missingMinutes <= 1 + PRICE_CALC_EPSILON_HOURS * 60 &&
      totalCoveredMinutes > PRICE_CALC_EPSILON_HOURS * 60
    ) {
      const avgHourlyRate = (totalPrice / totalCoveredMinutes) * 60;
      totalPrice += (missingMinutes / 60) * avgHourlyRate;
    }
  }

  const isCrossSlotBooking = overlappedSlotKeys.size > 1;
  const roundToThousand = (value: number): number => {
    if (isCrossSlotBooking) {
      return Math.ceil(value / 1000) * 1000;
    }

    return Math.round(value / 1000) * 1000;
  };

  return roundToThousand(totalPrice);
};

interface BookingFormProps {
  roomType: RoomType;
  prices: Price[];
}

export default function BookingForm({ roomType, prices }: BookingFormProps) {
  const router = useRouter();
  const { downloadTicket } = useTicketActions();
  const isDorm = roomType === "Dorm";

  // State management
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string>("");

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookingDetails, setBookingDetails] = useState<{
    name: string;
    phone: string;
    date: string;
    time: string;
    roomType: string;
  } | null>(null);

  // Cancel booking states
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<BookingFormValues, unknown, BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      customerName: "",
      customerPhone: "",
      roomType: roomType,
      startTime: "",
      endTime: "",
      activityType: isDorm ? "nintendo-switch" : "",
      note: "",
    },
  });

  const activityType = watch("activityType");

  // Memoized calculations
  const availableTimes = useMemo(() => {
    return selectedDate ? getAvailableStartTimes(selectedDate) : [];
  }, [selectedDate]);

  // Thời lượng tối đa theo giờ đóng cửa từng ngày
  const durationOptions = useMemo(() => {
    if (!selectedDate || !selectedStartTime) {
      return DURATION_OPTIONS;
    }

    const [h, m] = selectedStartTime.split(":").map(Number);
    const startMinutes = h * 60 + m;

    const closeMinutes = isEveTet2026(selectedDate)
      ? EVE_TET_CLOSE_MINUTES
      : DEFAULT_CLOSE_MINUTES;
    const maxDurationHours = (closeMinutes - startMinutes) / 60;

    return DURATION_OPTIONS.filter((o) => o.value <= maxDurationHours);
  }, [selectedDate, selectedStartTime]);

  const endTime = useMemo(() => {
    return calculateEndTime(selectedStartTime, selectedDuration);
  }, [selectedStartTime, selectedDuration]);

  const estimatedPrice = useMemo(() => {
    return calculateEstimatedPrice(
      selectedDate,
      selectedStartTime,
      selectedDuration,
      roomType,
      prices,
      holidays,
    );
  }, [
    selectedDate,
    selectedStartTime,
    selectedDuration,
    roomType,
    prices,
    holidays,
  ]);

  const selectedHoliday = useMemo(() => {
    if (!selectedDate || holidays.length === 0) return null;
    return (
      holidays.find((h) => sameDay(selectedDate, new Date(h.date))) ?? null
    );
  }, [selectedDate, holidays]);

  // Effects
  useEffect(() => {
    setIsClient(true);
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    fetch("/api/holidays")
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: HolidayItem[] }) => {
        if (json.success && Array.isArray(json.data)) setHolidays(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setValue("roomType", roomType);
  }, [roomType, setValue]);

  useEffect(() => {
    if (isDorm) {
      setValue("activityType", "nintendo-switch");
    }
  }, [isDorm, setValue]);

  useEffect(() => {
    if (!selectedDate || !isClient || !selectedStartTime) return;
    if (!availableTimes.includes(selectedStartTime)) {
      setSelectedStartTime("");
      setValue("startTime", "", { shouldDirty: true, shouldTouch: true });
    }
  }, [selectedDate, selectedStartTime, setValue, isClient, availableTimes]);

  useEffect(() => {
    if (!selectedStartTime) return;
    if (durationOptions.length === 0) {
      setSelectedStartTime("");
      setValue("startTime", "", { shouldDirty: true, shouldTouch: true });
      return;
    }
    const allowed = durationOptions.some((o) => o.value === selectedDuration);
    if (!allowed) {
      const fallbackDuration =
        durationOptions[durationOptions.length - 1]?.value;
      if (fallbackDuration && fallbackDuration !== selectedDuration) {
        setSelectedDuration(fallbackDuration);
      }
    }
  }, [selectedStartTime, selectedDuration, durationOptions, setValue]);

  useEffect(() => {
    if (selectedStartTime && selectedDuration && isClient) {
      setValue("endTime", endTime, { shouldDirty: true });
    }
  }, [selectedStartTime, selectedDuration, setValue, isClient, endTime]);

  // Handler functions với useCallback để tối ưu performance
  const onSubmit = useCallback(
    async (data: BookingFormData) => {
      if (!selectedStartTime || !selectedDuration || !selectedDate) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn thời gian hợp lệ",
          variant: "destructive",
        });
        return;
      }
      if (isTetDay1Off(selectedDate)) {
        toast({
          title: "Jozo nghỉ ngày mùng 1 Tết",
          description: "Hẹn khách iu vào ngày mùng 2.",
          variant: "destructive",
        });
        return;
      }
      if (isEveTet2026(selectedDate)) {
        const [endH, endM] = endTime.split(":").map(Number);
        if (endH * 60 + endM > EVE_TET_CLOSE_MINUTES) {
          toast({
            title: "Ngày 30 Tết",
            description: "9h (21h) quán đóng. Giờ kết thúc tối đa 21h.",
            variant: "destructive",
          });
          return;
        }
      }

      setIsSubmitting(true);

      try {
        // Tạo startTime và endTime với format ISO string +07:00
        const startTimeISO = createISOString(selectedDate, selectedStartTime);
        const endTimeISO = createISOString(selectedDate, endTime);

        const formData = new FormData();
        formData.append("customerName", data.customerName);
        formData.append("customerPhone", data.customerPhone);
        formData.append("roomType", data.roomType);
        formData.append("startTime", startTimeISO);
        formData.append("endTime", endTimeISO);
        formData.append("note", buildBookingNote(data.activityType, data.note) || "");
        formData.append("photoConsent", String(photoConsent));
        if (photoConsent) photoFiles.forEach((file) => formData.append("photos", file));

        const apiUrl = createApiEndpoint("/bookings/online");
        const response = await fetch(apiUrl, { method: "POST", body: formData });

        const result = await response.json();

        if (result.success) {
          // Hiển thị modal xác nhận
          const bookingId = result.booking?._id || "";
          const bookingCodeFromApi =
            result.booking?.bookingCode || bookingId.slice(0, 6).toUpperCase();
          setBookingId(bookingId);
          setBookingCode(bookingCodeFromApi);
          setBookingDetails({
            name: data.customerName,
            phone: data.customerPhone,
            date: selectedDate
              ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
              : "Đang tải...",
            time: `${selectedStartTime} - ${endTime}`,
            roomType: ROOM_TYPE_LABELS[data.roomType],
          });
          setShowConfirmModal(true);

          toast({
            title: "Đặt box thành công!",
            description: "Chúc mừng bạn đã đặt box thành công",
          });
        } else {
          toast({
            title: "Đặt box thất bại!",
            description:
              result.message || "Có lỗi xảy ra, vui lòng thử lại sau.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Booking error:", error);
        toast({
          title: "Đặt box thất bại!",
          description: "Có lỗi xảy ra, vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedStartTime, selectedDuration, selectedDate, endTime],
  );

  const copyBookingCode = useCallback(() => {
    navigator.clipboard.writeText(bookingCode);
    toast({
      title: "Đã sao chép",
      description: "Mã đặt box đã được sao chép vào clipboard",
    });
  }, [bookingCode]);

  const handleDownloadTicket = useCallback(async () => {
    if (!bookingDetails || !bookingCode) return;

    const result = await downloadTicket({
      ...bookingDetails,
      bookingCode,
    });

    if (result.success) {
      toast({
        title: result.needsManualSave ? "Đã mở vé!" : "Tải xuống thành công!",
        description: result.message || "Vé đặt box đã được tải xuống.",
      });
    } else {
      toast({
        title: "Lỗi tải xuống",
        description:
          result.message || "Có lỗi xảy ra khi tải xuống vé. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [bookingDetails, bookingCode, downloadTicket]);

  const handleCancelBooking = useCallback(async () => {
    if (!bookingId || !bookingDetails) return;

    setIsCancelling(true);

    try {
      const result = await cancelBooking(bookingId, bookingDetails.phone);

      if (result.success) {
        toast({
          title: "Hủy booking thành công!",
          description: "Booking đã được hủy thành công.",
        });

        // Đóng modal và reset state
        setShowConfirmModal(false);
        setShowCancelModal(false);
        setBookingId("");
        setBookingCode("");
        setBookingDetails(null);

        // Reset form
        router.push("/");
      } else {
        toast({
          title: "Hủy booking thất bại!",
          description: result.message || "Có lỗi xảy ra khi hủy booking.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast({
        title: "Hủy booking thất bại!",
        description: "Có lỗi xảy ra khi hủy booking. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  }, [bookingId, bookingDetails, router]);

  // Helper functions
  const getSelectedHours = useCallback((): string => {
    if (selectedDuration % 1 === 0) {
      return `${selectedDuration} giờ`;
    } else {
      const hours = Math.floor(selectedDuration);
      return hours > 0 ? `${hours},5 giờ` : "0,5 giờ";
    }
  }, [selectedDuration]);

  return (
    <div className={formCardClassName}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 py-2 text-primary/70 hover:bg-primary/8 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Quay về</span>
        </button>

        <h1 className="md:text-3xl text-xl font-bold text-primary text-center">
          {ROOM_TYPE_LABELS[roomType]}
        </h1>

        <div className="hidden md:block" />
      </div>

      <div className="mb-5 bg-accent/60 border-l-4 border-primary p-3 rounded-r-lg text-sm text-primary">
        <p className="font-semibold">Thành viên mới giảm ngay 10% lần đầu</p>
        <p className="mt-1 text-primary/80">
          Không áp dụng cho các ngày lễ.
        </p>
        <Link
          href="/register"
          className="font-semibold underline underline-offset-2 hover:text-primary"
        >
          Đăng ký ngay
        </Link>
        {" · "}
        <Link
          href="/promotions/dang-ky-thanh-vien"
          className="underline underline-offset-2 hover:text-primary"
        >
          Xem chi tiết
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Customer Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Thông tin khách hàng
          </h2>

          <div className="space-y-4">
            <Input
              label="Họ và tên"
              {...register("customerName")}
              placeholder="Nhập họ và tên của bạn"
              required
              error={errors.customerName?.message}
              prefix={<User className="h-4 w-4" />}
              maxLength={50}
            />

            <Input
              label="Số điện thoại"
              {...register("customerPhone")}
              placeholder="Nhập số điện thoại của bạn"
              type="tel"
              maxLength={10}
              required
              error={errors.customerPhone?.message}
              prefix={<Phone className="h-4 w-4" />}
            />

            {!isDorm && (
              <div>
                <label className="block text-primary mb-1">
                  Dịch vụ
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register("activityType")}
                  className="w-full border rounded px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Chọn dịch vụ</option>
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.activityType && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.activityType.message}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-lg border border-primary/20 p-4 space-y-3">
              <label className="flex items-center gap-3 text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={photoConsent}
                  onChange={(event) => {
                    setPhotoConsent(event.target.checked);
                    if (!event.target.checked) { setPhotoFiles([]); setPhotoPreviews([]); }
                  }}
                  className="h-4 w-4"
                />
                <span className="font-medium">Cho phép hiển thị hình ảnh trên TV</span>
              </label>
              <p className="text-sm text-muted-foreground">Ảnh được ẩn mặc định. Staff chỉ hiển thị khi khách đã tới.</p>
              {photoConsent && (
                <div className="space-y-3">
                  <label className="group flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center transition hover:border-primary hover:bg-primary/10">
                    {photoPreviews[0] ? (
                      <div className="relative w-full max-w-xs">
                        <img src={photoPreviews[0]} alt="Ảnh đã chọn" className="h-40 w-full rounded-lg object-cover shadow-sm" />
                        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">Bấm để đổi ảnh</span>
                      </div>
                    ) : (
                      <><Upload className="mb-2 h-8 w-8 text-primary" /><span className="font-medium text-primary">Chọn ảnh để hiển thị</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG hoặc WEBP · tối đa 10 MB</span></>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size > 10 * 1024 * 1024) { setPhotoFiles([]); setPhotoPreviews([]); setPhotoError("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10 MB."); return; } setPhotoError(""); const files = file ? [file] : []; setPhotoFiles(files); setPhotoPreviews(files.map((item) => URL.createObjectURL(item))); }} />
                  </label>
                  {photoPreviews[0] && <button type="button" onClick={() => { setPhotoFiles([]); setPhotoPreviews([]); }} className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"><X className="h-4 w-4" /> Xóa ảnh</button>}
                  {photoError && <p className="text-sm text-red-600">{photoError}</p>}
                  <p className="text-xs text-muted-foreground">Ảnh được ẩn mặc định. Staff chỉ hiển thị khi khách đã tới.</p>
                </div>
              )}
            </div>

            <Input
              label="Ghi chú"
              {...register("note")}
              placeholder={
                activityType === "nintendo-switch"
                  ? "Thêm bạn muốn chơi game gì?"
                  : activityType === "music-box"
                    ? "Nhập ghi chú cho Jozo nhé"
                    : "Nhập ghi chú"
              }
              helpText={
                activityType === ""
                  ? "VD: Tổ chức sinh nhật, tổ chức tiệc, ..."
                  : undefined
              }
              maxLength={100}
            />
          </div>
        </div>

        {/* Booking Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Thông tin đặt box
          </h2>

          <div className="space-y-4">
            {/* Date Selection */}
            <div>
              <div className="relative">
                {isClient && selectedDate ? (
                  <>
                    <DateSelect
                      value={selectedDate}
                      onChange={setSelectedDate}
                      label="Ngày đặt"
                      required
                    />
                    {selectedHoliday && (
                      <p className="mt-1.5 text-sm font-medium text-primary">
                        Ngày lễ: {selectedHoliday.name}
                      </p>
                    )}
                    {isTetDay1Off(selectedDate) && (
                      <p className="mt-1.5 text-sm font-medium text-primary bg-accent/50 border border-primary/30 rounded px-3 py-2">
                        Jozo nghỉ ngày mùng 1, hẹn khách iu vào ngày mùng 2.
                      </p>
                    )}
                    {isEveTet2026(selectedDate) && (
                      <p className="mt-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-300 rounded px-3 py-2">
                        Ngày 30 Tết: 21h (9h tối) Jozo nghỉ để dọn dẹp đón giao
                        thừa. Giờ kết thúc tối đa 21h (nếu đặt 8h thì 9h phải
                        đóng).
                      </p>
                    )}
                  </>
                ) : (
                  <div className="w-full border rounded px-3 py-2 text-primary/50 bg-primary/8">
                    Đang tải...
                  </div>
                )}
              </div>
            </div>

            {/* Start Time Selection */}
            <div>
              <label className="block text-primary mb-1">
                Giờ bắt đầu
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedStartTime}
                  onChange={(e) => {
                    const nextStartTime = e.target.value;
                    if (nextStartTime === selectedStartTime) return;
                    setSelectedStartTime(nextStartTime);
                    setValue("startTime", nextStartTime, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  className="w-full border rounded px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={!isClient || !selectedDate}
                >
                  <option value="">Chọn giờ bắt đầu</option>
                  {isClient &&
                    selectedDate &&
                    availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                </select>
              </div>
              {isClient && selectedDate && availableTimes.length === 0 && (
                <p className="mt-1 text-sm text-orange-500">
                  Không còn giờ trống trong ngày này. Vui lòng chọn ngày khác.
                </p>
              )}
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            {/* Duration Selection */}
            {selectedStartTime && (
              <div>
                <label className="block text-primary mb-1">
                  Thời lượng
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDuration}
                    onChange={(e) => {
                      const duration = parseFloat(e.target.value);
                      setSelectedDuration(duration);
                    }}
                    className="w-full border rounded px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-sm text-primary/55">
                  Bạn có thể chọn số giờ sử dụng phù hợp với nhu cầu của mình
                </p>
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary - ẩn khi chọn ngày mùng 1 Tết */}
        {isClient &&
          selectedStartTime &&
          selectedDuration &&
          selectedDate &&
          !isTetDay1Off(selectedDate) && (
            <div className="mb-6 p-4 bg-primary/6 rounded-md">
              <h2 className="text-lg font-semibold text-primary mb-2">
                Thông tin đặt box
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-primary">Loại box:</span>
                  <span className="font-medium text-primary">
                    {ROOM_TYPE_LABELS[roomType]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">Ngày:</span>
                  <span className="font-medium text-primary">
                    {selectedDate
                      ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                      : "Đang tải..."}
                    {selectedHoliday && (
                      <span className="ml-1 text-primary/90 font-normal">
                        ({selectedHoliday.name})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">Thời gian:</span>
                  <span className="font-medium text-primary">
                    {selectedStartTime} - {endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">Số giờ:</span>
                  <span className="font-medium text-primary">
                    {getSelectedHours()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">Giá dự kiến:</span>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg block">
                      {!isClient || prices.length === 0
                        ? "Đang tải..."
                        : `${estimatedPrice.toLocaleString("vi-VN")}đ`}
                    </span>
                    {isClient && prices.length > 0 && estimatedPrice > 0 && (
                      <span className="text-sm text-primary/70 block mt-0.5">
                        Member mới:{" "}
                        <span className="font-semibold text-primary">
                          {Math.round(estimatedPrice * 0.9).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </span>{" "}
                        (−10%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm border-t pt-3 text-primary/70">
                {isEveTet2026(selectedDate) && (
                  <p className="mb-2 text-amber-700 font-medium">
                    21h (9h tối) Jozo nghỉ để dọn dẹp đón giao thừa. Giờ kết
                    thúc tối đa 21h.
                  </p>
                )}
                <p className="mb-1">
                  <span className="font-medium">Lưu ý về thanh toán:</span> Quý
                  khách sẽ thanh toán sau khi sử dụng dịch vụ. Jozo không nhận
                  cọc/thanh toán trước.
                </p>

                <p className="text-red-500">
                  Nếu đến trễ quá 15 phút so với giờ đặt, box sẽ được hủy và có
                  thể được sắp xếp cho khách khác.
                </p>
              </div>
            </div>
          )}

        {isTetDay1Off(selectedDate) ? (
          <div className="w-full py-3 mt-6 text-center font-medium text-primary bg-accent/45 border border-primary/30 rounded-lg">
            Jozo nghỉ ngày mùng 1, hẹn khách iu vào ngày mùng 2.
          </div>
        ) : (
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !isClient ||
              !selectedDate ||
              !selectedStartTime ||
              !selectedDuration ||
              (isClient && selectedDate && availableTimes.length === 0)
            }
            className="w-full py-3 mt-6 font-medium tracking-wide text-primary-foreground bg-primary rounded-lg hover:bg-brand-hover transition duration-2000 animate-buttonheartbeat disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang xử lý..." : "Đặt ngay"}
          </button>
        )}
      </form>

      {/* Confirmation Modal */}
      <BookingSuccessModal
        isOpen={showConfirmModal}
        bookingDetails={bookingDetails!}
        bookingId={bookingId}
        bookingCode={bookingCode}
        onCopyCode={copyBookingCode}
        onDownloadTicket={handleDownloadTicket}
      />

      {/* Cancel Confirmation Modal */}
      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelBooking}
        isCancelling={isCancelling}
        bookingDetails={bookingDetails}
        bookingCode={bookingCode}
      />
    </div>
  );
}
