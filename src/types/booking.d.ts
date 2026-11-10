export type RoomType = "Small" | "Medium" | "Large" | "Dorm";

export type QueueSong = {
  video_id: string;
  title: string;
  thumbnail: string;
  author: string;
  duration: number;
  position?: string;
};

export type Booking = {
  _id: ObjectId;
  bookingCode?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  /** BE có thể trả "Medium" hoặc "medium" — normalize khi hiển thị */
  actualRoomType: string;
  originalRoomType: string;
  startTime: string; // ISO string với timezone +07:00
  endTime: string; // ISO string với timezone +07:00
  note?: string;
  status?: "booked" | "cancelled" | "completed" | "finished" | "in use";
  createdAt?: string;
  updatedAt?: string;
  queueSongs?: QueueSong[];
};

export type BookingResponse = {
  success: boolean;
  data?: Booking | Booking[];
  message?: string;
};

// Type cho request gửi lên API
export type BookingRequest = {
  customerName: string;
  customerPhone: string;
  roomType: "Small" | "Medium" | "Large" | "Dorm";
  startTime: string; // ISO string với timezone +07:00
  endTime: string; // ISO string với timezone +07:00
  activityType: "nintendo-switch" | "music-box";
  note?: string;
};
