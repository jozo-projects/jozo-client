import clientPromise from "@/lib/mongodb";
import {
  serializeMongoDocument,
  serializeMongoDocuments,
} from "@/lib/serialize-utils";
import { extractQueueSongs } from "@/lib/queue-songs";
import { Booking } from "@/types/booking";
import { Price } from "@/types/price";
import { RoomType } from "@/types/room";
import { ObjectId } from "mongodb";
import { cache } from "react";
import { unstable_cache } from "next/cache";

export const getRoomTypes = unstable_cache(
  async (): Promise<RoomType[]> => {
    try {
      const client = await clientPromise;
      const db = client.db("jozo");
      const roomTypes = await db.collection("roomTypes").find({}).toArray();
      return serializeMongoDocuments(roomTypes) as unknown as RoomType[];
    } catch (error) {
      console.error("Error fetching room types:", error);
      return [];
    }
  },
  ["room-types"],
  {
    tags: ["room-types"],
    revalidate: 60,
  },
);

export const getPrices = unstable_cache(
  async (): Promise<Price[]> => {
    try {
      const client = await clientPromise;
      const db = client.db("jozo");
      const prices = await db.collection("prices").find({}).toArray();
      return serializeMongoDocuments(prices) as unknown as Price[];
    } catch (error) {
      console.error("Error fetching prices:", error);
      return [];
    }
  },
  ["prices"],
  {
    tags: ["prices"],
    revalidate: 300,
  },
);

/**
 * Lấy booking details kèm queue hiện tại.
 * Không dùng unstable_cache vì queueSongs đổi thường xuyên.
 */
export const getBookingDetails = cache(
  async (id: string): Promise<Booking | null> => {
    try {
      if (!ObjectId.isValid(id)) {
        return null;
      }

      const client = await clientPromise;
      const db = client.db("jozo");

      const booking = await db.collection("room_schedules").findOne({
        _id: new ObjectId(id),
      });

      if (!booking) {
        return null;
      }

      const serialized = serializeMongoDocument(booking) as Booking;
      return {
        ...serialized,
        queueSongs: extractQueueSongs(serialized),
      };
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return null;
    }
  },
);

/**
 * Cached function để lấy danh sách phòng với giá
 */
export const getRoomsWithPrices = cache(async () => {
  try {
    const client = await clientPromise;
    const db = client.db("jozo");

    // Lấy danh sách phòng
    const rooms = await db.collection("rooms").find({}).toArray();

    // Lấy bảng giá (mặc định lấy giá ngày thường)
    const prices = await db
      .collection("prices")
      .findOne({ day_type: "weekday" });

    if (!prices) {
      throw new Error("Price data not found");
    }

    // Thêm thông tin giá vào từng phòng
    const roomsWithPrices = rooms.map((room) => {
      const roomPrices = prices.time_slots.map(
        (slot: {
          start: string;
          end: string;
          prices: Array<{ room_type: string; price: number }>;
        }) => {
          const priceInfo = slot.prices.find((p) => p.room_type === room.type);
          return {
            timeSlot: `${slot.start}-${slot.end}`,
            price: priceInfo ? priceInfo.price : 0,
          };
        }
      );

      return {
        ...room,
        prices: roomPrices,
      };
    });

    // Serialize MongoDB documents để có thể truyền sang Client Component
    return serializeMongoDocuments(roomsWithPrices);
  } catch (error) {
    console.error("Error fetching rooms with prices:", error);
    throw error;
  }
});

/**
 * Cached function để lấy room data theo type cho SSR
 */
export const getRoomDataByType = unstable_cache(
  async (roomType: string) => {
    try {
      const client = await clientPromise;
      const db = client.db("jozo");

      // Lấy danh sách phòng theo type (field trong DB là "type", không phải "roomType")
      const rooms = await db
        .collection("roomTypes")
        .find({ type: roomType.toLowerCase() })
        .toArray();

      if (!rooms.length) {
        return {
          rooms: [],
          prices: [
            {
              _id: "mock-price",
              day_type: "weekday",
              time_slots: [
                {
                  start: "10:00",
                  end: "12:00",
                  prices: [
                    { room_type: "small", price: 50000 },
                    { room_type: "medium", price: 70000 },
                    { room_type: "large", price: 90000 },
                    { room_type: "dorm", price: 10000 },
                  ],
                },
                {
                  start: "12:00",
                  end: "18:00",
                  prices: [
                    { room_type: "small", price: 60000 },
                    { room_type: "medium", price: 80000 },
                    { room_type: "large", price: 100000 },
                    { room_type: "dorm", price: 15000 },
                  ],
                },
                {
                  start: "18:00",
                  end: "22:00",
                  prices: [
                    { room_type: "small", price: 70000 },
                    { room_type: "medium", price: 90000 },
                    { room_type: "large", price: 110000 },
                    { room_type: "dorm", price: 20000 },
                  ],
                },
              ],
            },
            {
              _id: "mock-price-weekend",
              day_type: "weekend",
              time_slots: [
                {
                  start: "10:00",
                  end: "12:00",
                  prices: [
                    { room_type: "small", price: 60000 },
                    { room_type: "medium", price: 80000 },
                    { room_type: "large", price: 100000 },
                    { room_type: "dorm", price: 10000 },
                  ],
                },
                {
                  start: "12:00",
                  end: "18:00",
                  prices: [
                    { room_type: "small", price: 70000 },
                    { room_type: "medium", price: 90000 },
                    { room_type: "large", price: 110000 },
                    { room_type: "dorm", price: 15000 },
                  ],
                },
                {
                  start: "18:00",
                  end: "22:00",
                  prices: [
                    { room_type: "small", price: 80000 },
                    { room_type: "medium", price: 100000 },
                    { room_type: "large", price: 120000 },
                    { room_type: "dorm", price: 20000 },
                  ],
                },
              ],
            },
          ],
        };
      }

      // Lấy bảng giá
      const prices = await db.collection("prices").find({}).toArray();

      // Serialize MongoDB documents để có thể truyền sang Client Component
      return {
        rooms: serializeMongoDocuments(rooms),
        prices: serializeMongoDocuments(prices),
      };
    } catch (error) {
      console.error("Error fetching room data by type:", error);
      // Fallback trong trường hợp lỗi
      return {
        rooms: [],
        prices: [
          {
            _id: "error-fallback-price",
            day_type: "weekday",
            time_slots: [
              {
                start: "10:00",
                end: "22:00",
                prices: [
                  { room_type: "small", price: 50000 },
                  { room_type: "medium", price: 70000 },
                  { room_type: "large", price: 90000 },
                  { room_type: "dorm", price: 10000 },
                ],
              },
            ],
          },
        ],
      };
    }
  },
  ["room-data-by-type"],
  {
    tags: ["room-data"],
    revalidate: 60, // Cache trong 60 giây
  }
);
