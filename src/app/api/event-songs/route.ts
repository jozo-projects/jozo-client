import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });
  const base = (process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${base}/room-music/event-songs?${params}`, { cache: "no-store", signal: request.signal });
    if (!response.ok) throw new Error("Catalog unavailable");
    const data = await response.json();
    if (!Array.isArray(data?.songs)) throw new Error("Invalid catalog response");
    const songs = data.songs.filter((song: unknown) => {
      if (!song || typeof song !== "object") return false;
      const item = song as Record<string, unknown>;
      if (typeof item.hls_url !== "string" || typeof item.video_id !== "string" || typeof item.title !== "string") return false;
      try { const url = new URL(item.hls_url); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
    }).map((song: { video_id: string; title: string; author?: string; hls_url: string }) => ({
      video_id: song.video_id, title: song.title, author: song.author, hls_url: song.hls_url,
    }));
    return NextResponse.json({ songs }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không thể tải danh mục nhạc." }, { status: 502 });
  }
}
