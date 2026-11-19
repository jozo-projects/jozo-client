export type EventVideo = { video_id: string; title: string; author?: string };

export async function searchEventVideos(query: string, signal?: AbortSignal, fetcher: typeof fetch = fetch): Promise<EventVideo[]> {
  const response = await fetcher(`/api/search-videos?${new URLSearchParams({ query: query.trim() })}`, { signal });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error("Không thể tìm video. Vui lòng thử lại.");
  const result = await response.json();
  if (!Array.isArray(result.videos)) throw new Error("Không thể tìm video. Vui lòng thử lại.");
  return result.videos.filter((video: EventVideo) => typeof video.video_id === "string" && /^[A-Za-z0-9_-]{11}$/.test(video.video_id) && typeof video.title === "string");
}
