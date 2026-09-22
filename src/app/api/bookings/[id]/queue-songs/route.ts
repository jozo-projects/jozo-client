import clientPromise from "@/lib/mongodb";
import { extractQueueSongs } from "@/lib/queue-songs";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Booking ID không hợp lệ", queueSongs: [] },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("jozo");
    const booking = await db.collection("room_schedules").findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy booking", queueSongs: [] },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        queueSongs: extractQueueSongs(booking),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Lỗi server", queueSongs: [] },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Forward request to backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000";
    const response = await fetch(`${backendUrl}/bookings/${id}/queue-songs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (response.ok) {
      // Revalidate cache bằng tags để đảm bảo dữ liệu mới được fetch
      revalidateTag("booking-details", "max");

      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: response.status });
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}
