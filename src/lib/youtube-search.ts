import { Innertube } from "youtubei.js";

export type SearchVideo = {
  video_id: string;
  title: string;
  duration: number;
  url: string;
  thumbnail: string;
  author: string;
};

const SEARCH_LIMIT = 30;
const KARAOKE_IN_TITLE = /\bkaraoke\b/i;
const LYRICS_IN_TITLE = /\blyrics?\b|lời\s+(bài\s+)?hát/i;
const OFFICIAL_IN_TITLE =
  /\bofficial\b|\bmv\s*official\b|\bofficial\s*(music\s*)?(video|mv)\b/i;

let innertubePromise: Promise<Innertube> | null = null;

function parseDurationToSeconds(input: unknown): number {
  if (typeof input === "number" && Number.isFinite(input)) {
    if (input <= 0) return 0;
    return input > 10_000 ? Math.round(input / 1000) : Math.round(input);
  }

  if (!input) return 0;

  if (typeof input === "object") {
    const value = input as {
      seconds?: number;
      simpleText?: string;
      text?: string;
    };
    if (typeof value.seconds === "number") {
      return parseDurationToSeconds(value.seconds);
    }
    if (typeof value.simpleText === "string") {
      return parseDurationToSeconds(value.simpleText);
    }
    if (typeof value.text === "string") {
      return parseDurationToSeconds(value.text);
    }
    if (typeof (input as { toString?: () => string }).toString === "function") {
      const asText = String(input);
      if (asText && asText !== "[object Object]") {
        return parseDurationToSeconds(asText);
      }
    }
  }

  const text = String(input).trim();
  if (!text || !/^\d+:\d{1,2}(:\d{1,2})?$/.test(text)) return 0;

  const parts = text.split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function nodeText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && "toString" in value) {
    const text = (value as { toString: () => string }).toString();
    if (text && text !== "[object Object]") return text;
  }
  return "";
}

function thumbnailFromList(
  thumbnails: Array<{ url?: string }> | undefined,
): string {
  if (!thumbnails?.length) return "";
  return thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || "";
}

function fallbackThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function buildKaraokeQuery(query: string): string {
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  if (KARAOKE_IN_TITLE.test(trimmed)) return trimmed;
  return `${trimmed} karaoke`;
}

function karaokeRank(title: string): number {
  if (KARAOKE_IN_TITLE.test(title)) return 0;
  if (LYRICS_IN_TITLE.test(title)) return 1;
  if (OFFICIAL_IN_TITLE.test(title)) return 2;
  return 3;
}

function rankKaraokeVideos(videos: SearchVideo[]): SearchVideo[] {
  return videos
    .map((video, index) => ({ video, index, rank: karaokeRank(video.title) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ video }) => video);
}

function stripKaraokeKeyword(query: string): string {
  return query.replace(KARAOKE_IN_TITLE, " ").replace(/\s+/g, " ").trim();
}

function dedupeVideos(videos: SearchVideo[]): SearchVideo[] {
  const seen = new Set<string>();
  const unique: SearchVideo[] = [];
  for (const video of videos) {
    if (seen.has(video.video_id)) continue;
    seen.add(video.video_id);
    unique.push(video);
  }
  return unique;
}

function toSearchVideo(params: {
  video_id?: string | null;
  title?: string;
  duration?: number;
  thumbnail?: string;
  author?: string;
}): SearchVideo | null {
  const video_id = params.video_id?.trim();
  const title = params.title?.trim();
  if (!video_id || !title) return null;

  return {
    video_id,
    title,
    duration: params.duration || 0,
    url: `https://youtube.com/watch?v=${video_id}`,
    thumbnail: params.thumbnail || fallbackThumbnail(video_id),
    author: params.author?.trim() || "",
  };
}

function getInnertube(): Promise<Innertube> {
  if (!innertubePromise) {
    innertubePromise = Innertube.create({
      retrieve_player: false,
      generate_session_locally: true,
      lang: "vi",
      location: "VN",
    }).catch((error) => {
      innertubePromise = null;
      throw error;
    });
  }

  return innertubePromise;
}

function durationFromYoutubeiNode(node: Record<string, unknown>): number {
  const direct = parseDurationToSeconds(node.duration);
  if (direct) return direct;

  const fromLength = parseDurationToSeconds(nodeText(node.length_text));
  if (fromLength) return fromLength;

  const overlays = [
    node.thumbnail_overlays,
    (node.content_image as { overlays?: unknown } | undefined)?.overlays,
    (
      node.content_image as
        | { primary_thumbnail?: { overlays?: unknown } }
        | undefined
    )?.primary_thumbnail?.overlays,
  ];

  for (const overlayGroup of overlays) {
    if (!Array.isArray(overlayGroup)) continue;
    for (const overlay of overlayGroup) {
      const overlayNode = overlay as {
        text?: unknown;
        badges?: Array<{ text?: unknown }>;
      };
      const badgeTexts = overlayNode.badges?.map((badge) => badge.text) ?? [];
      for (const candidate of [overlayNode.text, ...badgeTexts]) {
        const seconds = parseDurationToSeconds(nodeText(candidate));
        if (seconds) return seconds;
      }
    }
  }

  return 0;
}

function mapYoutubeiItem(item: unknown): SearchVideo | null {
  if (!item || typeof item !== "object") return null;
  const node = item as Record<string, unknown>;
  const contentType = String(node.content_type || "");

  if (
    contentType &&
    contentType !== "VIDEO" &&
    contentType !== "SHORT" &&
    contentType !== "UNSPECIFIED"
  ) {
    return null;
  }

  if (node.is_live === true) return null;

  const videoId =
    (typeof node.video_id === "string" && node.video_id) ||
    (node.type === "LockupView" && typeof node.content_id === "string"
      ? node.content_id
      : "") ||
    (typeof node.id === "string" ? node.id : "");

  const metadata = node.metadata as
    | {
        title?: unknown;
        metadata?: {
          metadata_rows?: Array<{
            metadata_parts?: Array<{ text?: unknown }>;
          }>;
        };
      }
    | undefined;

  const contentImage = node.content_image as
    | {
        image?: Array<{ url?: string }>;
        primary_thumbnail?: { image?: Array<{ url?: string }> };
      }
    | undefined;

  const authorFromMetadata =
    metadata?.metadata?.metadata_rows
      ?.flatMap((row) => row.metadata_parts || [])
      .map((part) => nodeText(part.text))
      .find(Boolean) || "";

  return toSearchVideo({
    video_id: videoId,
    title: nodeText(node.title) || nodeText(metadata?.title),
    duration: durationFromYoutubeiNode(node),
    thumbnail:
      (node.best_thumbnail as { url?: string } | undefined)?.url ||
      thumbnailFromList(node.thumbnails as Array<{ url?: string }>) ||
      thumbnailFromList(contentImage?.image) ||
      thumbnailFromList(contentImage?.primary_thumbnail?.image),
    author:
      (node.author as { name?: string } | undefined)?.name || authorFromMetadata,
  });
}

async function searchYoutubei(query: string): Promise<SearchVideo[]> {
  const yt = await getInnertube();
  const search = await yt.search(query, { type: "video" });
  return (search.videos || [])
    .map(mapYoutubeiItem)
    .filter((video): video is SearchVideo => video !== null)
    .slice(0, SEARCH_LIMIT);
}

async function searchRankedVideos(query: string): Promise<SearchVideo[]> {
  const base = stripKaraokeKeyword(query);
  if (!base) return [];

  const queries = Array.from(
    new Set([`${base} karaoke`, `${base} lyrics`, `${base} official`]),
  );

  const settled = await Promise.allSettled(
    queries.map((item) => searchYoutubei(item)),
  );
  const videos: SearchVideo[] = [];
  let lastError: unknown;

  for (const result of settled) {
    if (result.status === "fulfilled") {
      videos.push(...result.value);
    } else {
      lastError = result.reason;
    }
  }

  if (!videos.length && lastError) throw lastError;
  return rankKaraokeVideos(dedupeVideos(videos));
}

export async function searchYoutubeVideos(query: string): Promise<{
  videos: SearchVideo[];
  search_query: string;
}> {
  const searchQuery = buildKaraokeQuery(query);
  const videos = await searchRankedVideos(query);
  return { videos, search_query: searchQuery };
}
