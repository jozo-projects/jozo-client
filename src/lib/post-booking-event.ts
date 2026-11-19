import type { EventBooking } from './event-booking';

// Do not enable until private R2 retention, deletion/retry and recovery are verified.
export const POST_BOOKING_EVENT_SAVE_ENABLED = false;
const key = (id: string) => `jozo:booking-proof:${id.toLowerCase()}`;
const validId = (id: string) => /^[a-f\d]{24}$/i.test(id);

// sessionStorage survives reload in this tab, not tab closure. Same-origin scripts can read it.
export function rememberBookingProof(storage: Pick<Storage, 'setItem'>, id: string, proof: unknown): boolean {
  if (!validId(id) || typeof proof !== 'string' || !proof) return false;
  try { storage.setItem(key(id), proof); return true; } catch { return false; }
}
export function getBookingProof(storage: Pick<Storage, 'getItem'>, id: string): string | null {
  if (!validId(id)) return null;
  try { return storage.getItem(key(id)); } catch { return null; }
}

// This endpoint replaces the complete event; an empty form clears it.
export function makePostBookingEventBody(event: EventBooking): FormData {
  if (event.preparing) throw new Error('Vui lòng đợi ảnh được xử lý xong.');
  if (event.photos.length > 10 || event.photos.some(p => !['image/jpeg', 'image/png'].includes(p.type) || p.size === 0 || p.size >= 1024 * 1024)) throw new Error('Chỉ hỗ trợ tối đa 10 ảnh JPEG hoặc PNG nhỏ hơn 1 MiB.');
  if (event.photos.length && !event.consent) throw new Error('Vui lòng đồng ý sử dụng ảnh cho sự kiện.');
  if (event.videoId && (event.videoId.length > 128 || !event.videoId.trim())) throw new Error('Bài nhạc không hợp lệ.');
  const body = new FormData();
  if (event.videoId) body.append('musicVideoId', event.videoId);
  if (event.photos.length) body.append('photoConsent', 'true');
  for (const photo of event.photos) body.append('photos', photo);
  return body;
}

export async function saveBookingEvent(id: string, proof: string, event: EventBooking, fetcher: typeof fetch = fetch, apiBase = ''): Promise<void> {
  if (!POST_BOOKING_EVENT_SAVE_ENABLED) throw new Error('Tính năng lưu sự kiện chưa khả dụng.');
  if (!validId(id) || !proof) throw new Error('Không có quyền chỉnh sửa đặt box này.');
  const response = await fetcher(`${apiBase}/bookings/${id}/event`, {
    method: 'PUT', headers: { 'X-Jozo-Booking-Proof': proof }, body: makePostBookingEventBody(event), cache: 'no-store', redirect: 'error',
  });
  if (!response.ok) {
    const message = response.status === 401 ? 'Không có quyền chỉnh sửa đặt box này.' : response.status === 409 ? 'Đặt box không còn hợp lệ hoặc đã thay đổi. Vui lòng thử lại sau.' : response.status === 400 ? 'Ảnh hoặc bài nhạc không hợp lệ.' : 'Không thể lưu sự kiện. Vui lòng thử lại sau.';
    throw new Error(message);
  }
  const result = await response.json();
  if (result?.success !== true) throw new Error('Không thể xác nhận sự kiện đã được lưu.');
}
