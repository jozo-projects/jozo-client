"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { EventBooking, validateEventPhotos } from "@/lib/event-booking";
import { prepareEventPhotos } from "@/lib/event-photo";

type CatalogSong = { video_id: string; title: string; author?: string; hls_url: string };

type Props = { event: EventBooking | null; onChange: (event: EventBooking | null) => void };

export default function BookingEvent({ event, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<CatalogSong[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<CatalogSong | null>(null);
  const [audioError, setAudioError] = useState("");
  const [fullscreenError, setFullscreenError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [slide, setSlide] = useState(0);
  const [urls, setUrls] = useState<string[]>([]);
  const search = useRef<AbortController | null>(null);
  const version = useRef(0);
  const photoVersion = useRef(0);
  const photos = event?.photos;

  useEffect(() => {
    const next = (photos ?? []).map((photo) => URL.createObjectURL(photo));
    setUrls(next);
    setSlide(0);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);
  useEffect(() => {
    if (urls.length < 2) return;
    const timer = setInterval(() => setSlide((index) => (index + 1) % urls.length), 4000);
    return () => clearInterval(timer);
  }, [urls]);
  useEffect(() => () => { version.current++; photoVersion.current++; search.current?.abort(); }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedVideo) return;
    let disposed = false;
    let player: import("hls.js").default | undefined;
    setAudioError("");
    if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src = selectedVideo.hls_url;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (disposed) return;
        if (!Hls.isSupported()) { setAudioError("Trình duyệt không hỗ trợ phát nhạc HLS."); return; }
        player = new Hls();
        player.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setAudioError("Không thể phát nhạc. Vui lòng thử bài khác.");
        });
        player.loadSource(selectedVideo.hls_url);
        player.attachMedia(audio);
      }).catch(() => { if (!disposed) setAudioError("Không thể tải trình phát nhạc."); });
    }
    return () => { disposed = true; player?.destroy(); audio.pause(); audio.removeAttribute("src"); audio.load(); };
  }, [selectedVideo]);

  function invalidateSearch() {
    version.current++;
    search.current?.abort();
    setLoading(false);
    setVideos([]);
    setError("");
  }
  async function runSearch() {
    invalidateSearch();
    if (!query.trim()) { setError("Nhập tên bài hát."); return; }
    const controller = new AbortController();
    search.current = controller;
    const current = version.current;
    setLoading(true);
    try {
      const response = await fetch(`/api/event-songs?${new URLSearchParams({ q: query.trim() })}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Catalog unavailable");
      const { songs: results } = await response.json() as { songs: CatalogSong[] };
      if (current !== version.current) return;
      setVideos(results);
      if (!results.length) setError("Không tìm thấy bài có HLS sẵn sàng trong kết quả. Hãy thử từ khóa khác.");
    } catch {
      if (current === version.current) setError("Không thể tìm nhạc trong danh mục. Vui lòng thử lại.");
    } finally {
      if (current === version.current) setLoading(false);
    }
  }
  function move(index: number, direction: number) {
    if (!event) return;
    const next = [...event.photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...event, photos: next });
  }

  return <section className="my-5 space-y-5">
    {event && <div className="space-y-4">
      <fieldset disabled={event.preparing} className="space-y-4 rounded-2xl border border-primary/20 bg-accent/20 p-3 sm:p-5">
      <div className="space-y-2">
        <h3 className="font-semibold">Xem trước sự kiện</h3>
        <div ref={stageRef} className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl bg-black [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:rounded-none">
          {urls.length > 0 ? <img src={urls[slide] || urls[0]} alt={`Ảnh sự kiện ${slide + 1}`} className="absolute inset-0 h-full w-full object-contain" /> : <p className="p-4 text-center text-sm text-white/75">Thêm ảnh để xem trước</p>}
          {urls.length > 1 && <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">Ảnh {slide + 1} / {urls.length}</span>}
          <button type="button" className="absolute right-2 top-2 hidden rounded-md bg-black/70 px-3 py-2 text-sm text-white [*:fullscreen>&]:block" onClick={() => { void document.exitFullscreen(); }}>Thoát toàn màn hình</button>
        </div>
        {urls.length > 0 && <button type="button" className="glass-control rounded-lg px-4 py-2 text-sm" onClick={async () => { try { if (!stageRef.current?.requestFullscreen) throw new Error(); await stageRef.current.requestFullscreen(); setFullscreenError(""); } catch { setFullscreenError("Trình duyệt không hỗ trợ xem toàn màn hình."); } }}>Xem toàn màn hình</button>}
        {fullscreenError && <p role="alert" className="text-sm text-red-600">{fullscreenError}</p>}
      </div>
      <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">Ảnh của khách iu</p>
        <span className="text-sm text-foreground/75">{event.photos.length}/10 ảnh</span>
      </div>
      <p className="mt-1 text-sm text-foreground/75">Chọn ảnh và sắp xếp theo thứ tự muốn trình chiếu.</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
      {event.photos.map((photo, index) => <div key={`${photo.name}-${index}`} className="min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-black/30">
          {urls[index] && <img src={urls[index]} alt={`Ảnh ${index + 1}`} className="h-full w-full object-cover" />}
          <span className="absolute bottom-1 left-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">{index + 1}</span>
          <button type="button" aria-label={`Xóa ảnh ${index + 1}`} onClick={() => onChange({ ...event, photos: event.photos.filter((_, i) => i !== index) })} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70"><X className="h-4 w-4" /></span></button>
        </div>
        {event.photos.length > 1 && <div className="mt-1 flex items-center justify-center gap-1">
          <button type="button" aria-label={`Chuyển ảnh ${index + 1} về trước`} disabled={index === 0} onClick={() => move(index, -1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" aria-label={`Chuyển ảnh ${index + 1} về sau`} disabled={index === event.photos.length - 1} onClick={() => move(index, 1)} className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button>
        </div>}
      </div>)}
      {event.photos.length < 10 && <label className="glass-control flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl text-center text-sm font-medium text-foreground">
        <ImagePlus className="h-6 w-6" aria-hidden="true" />
        {event.photos.length ? "Thêm ảnh" : "Chọn ảnh"}
        <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={async (e) => {
          const selected = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!selected.length) return;
          if (event.photos.length + selected.length > 10) { setPhotoError("Chỉ được chọn tối đa 10 ảnh."); return; }
          const current = ++photoVersion.current;
          setPhotoError("");
          onChange({ ...event, preparing: true });
          try {
            const prepared = await prepareEventPhotos(selected);
            if (current !== photoVersion.current) return;
            const photos = [...event.photos, ...prepared];
            const error = validateEventPhotos(photos);
            if (error) throw new Error(error);
            onChange({ ...event, photos, preparing: false });
          } catch (error) {
            if (current !== photoVersion.current) return;
            setPhotoError(error instanceof Error ? error.message : "Không thể xử lý ảnh. Vui lòng chọn ảnh khác.");
            onChange({ ...event, preparing: false });
          }
        }} />
      </label>}
      </div>
      </div>
      {event.preparing && <p role="status" className="text-sm">Đang chuẩn bị ảnh...</p>}
      {photoError && <p role="alert" className="text-sm text-red-600">{photoError}</p>}

      <p className="rounded-lg border border-primary/20 bg-accent/30 p-3 text-sm text-foreground">
        Ảnh chỉ được dùng để xem thử trên thiết bị này, chưa được lưu vào đơn đặt box hoặc gửi đến TV.
      </p>
      <div className="space-y-2">
        <label htmlFor="event-video-search" className="block font-semibold">Nhạc xem thử <span className="font-normal text-foreground/70">(không bắt buộc)</span></label>
        <div className="flex gap-2"><input id="event-video-search" className="glass-control min-w-0 flex-1 rounded-lg px-3 py-2.5 text-foreground" value={query} placeholder="Tên bài hát" onChange={(e) => { invalidateSearch(); setQuery(e.target.value); }} />
          <button type="button" onClick={runSearch} disabled={loading} className="glass-control rounded-lg px-4 text-foreground">{loading ? "Đang tìm..." : "Tìm"}</button></div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {videos.map((video) => <button key={video.video_id} type="button" className="glass-control block w-full rounded-lg p-3 text-left text-sm text-foreground" onClick={() => { setSelectedVideo(video); onChange({ ...event, videoId: video.video_id }); invalidateSearch(); }}>
          {video.title}{video.author ? ` — ${video.author}` : ""}
        </button>)}
        {selectedVideo && <div className="glass-control rounded-lg p-3 text-sm"><p>Đang xem thử: {selectedVideo.title}</p><audio ref={audioRef} controls className="mt-2 w-full" onError={() => setAudioError("Không thể phát nhạc. Vui lòng thử bài khác.")} /><button type="button" className="mt-1 underline" onClick={() => { setSelectedVideo(null); onChange({ ...event, videoId: "" }); }}>Bỏ bài này</button>{audioError && <p role="alert" className="mt-2 text-red-600">{audioError}</p>}</div>}
      </div>

      </fieldset>
    </div>}
  </section>;
}
