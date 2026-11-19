export type EventBooking = { photos: File[]; consent: boolean; videoId: string; preparing?: boolean };

export function validateEventPhotos(photos: File[]): string | null {
  if (photos.length > 10) return "Chỉ được chọn tối đa 10 ảnh.";
  if (photos.some((photo) => !["image/jpeg", "image/png", "image/webp"].includes(photo.type))) return "Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.";
  // Busboy emits its file-size limit when the size reaches the configured limit.
  if (photos.some((photo) => photo.size === 0 || photo.size >= 1024 * 1024)) return "Mỗi ảnh phải có dữ liệu và nhỏ hơn 1 MiB (1024 KiB).";
  return null;
}

export function validateEvent(event: EventBooking): string | null {
  if (event.preparing) return "Vui lòng đợi ảnh được xử lý xong.";
  if (!event.photos.length) return "Vui lòng chọn từ 1 đến 10 ảnh.";
  const photoError = validateEventPhotos(event.photos);
  if (photoError) return photoError;
  if (!event.consent) return "Vui lòng đồng ý sử dụng ảnh cho sự kiện.";
  if (event.videoId && !/^[A-Za-z0-9_-]{11}$/.test(event.videoId)) return "Video YouTube không hợp lệ. Vui lòng chọn lại.";
  return null;
}

export function makeBookingRequest(booking: object, event: EventBooking | null): {body: string | FormData; headers?: Record<string, string>} {
  if (!event) return { headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) };
  const error = validateEvent(event);
  if (error) throw new Error(error);
  const body = new FormData();
  for (const [key, value] of Object.entries(booking)) if (value != null) body.append(key, String(value));
  body.append("eventEnabled", "true");
  body.append("photoConsent", "true");
  for (const photo of event.photos) body.append("photos", photo);
  if (event.videoId) body.append("eventYoutubeVideoId", event.videoId);
  return { body };
}
