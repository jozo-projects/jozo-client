import { z } from "zod";

export const bookingSchema = z.object({
  customerName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  customerPhone: z
    .string()
    .regex(
      /^(0)[0-9]{9}$/,
      "Số điện thoại không đúng định dạng Việt Nam (VD: 0912345678)"
    ),
  roomType: z.enum(["Small", "Medium", "Large", "Dorm"], {
    errorMap: () => ({ message: "Vui lòng chọn loại phòng hợp lệ" }),
  }),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  activityType: z
    .string()
    .min(1, "Vui lòng chọn dịch vụ")
    .pipe(
      z.enum(["nintendo-switch", "music-box", "music-box-and-nintendo-switch"], {
        errorMap: () => ({ message: "Vui lòng chọn dịch vụ" }),
      }),
    ),
  note: z.string().optional(),
});

export type BookingFormValues = z.input<typeof bookingSchema>;
export type BookingFormData = z.output<typeof bookingSchema>;
