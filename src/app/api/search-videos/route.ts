import { searchYoutubeVideos } from "@/lib/youtube-search";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const booking = searchParams.get("booking");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const result = await searchYoutubeVideos(query);
    if (!result.videos.length) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }

    const videos = result.videos.map((video) => ({
      ...video,
      booking_code: booking || null,
    }));

    return new NextResponse(
      JSON.stringify({
        videos,
        total: videos.length,
        query,
        search_query: result.search_query,
        booking_code: booking || null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600",
        },
      },
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
}
