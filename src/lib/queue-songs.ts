import { QueueSong } from "@/types/booking.d";

export function extractQueueSongs(source: unknown): QueueSong[] {
  if (!source || typeof source !== "object") return [];

  const record = source as Record<string, unknown>;
  const raw = record.queueSongs ?? record.queue;
  if (!Array.isArray(raw)) return [];

  return raw.filter((item): item is QueueSong => {
    if (!item || typeof item !== "object") return false;
    const song = item as Partial<QueueSong>;
    return typeof song.video_id === "string" && song.video_id.length > 0;
  });
}
