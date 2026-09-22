import RoomCard from "@/components/room-card/room-card";
import MobileSnapSlider from "@/components/mobile-snap-slider";
import { getPrices, getRoomTypes } from "@/lib/data-cache";
import { Price } from "@/types/price";
import { RoomType } from "@/types/room";

function roomDesktopLayoutClass(count: number): string {
  if (count <= 0) return "";
  if (count === 1) {
    return "gap-6 grid-cols-1 max-w-md mx-auto w-full";
  }
  if (count === 2) {
    return "gap-6 sm:grid-cols-2 max-w-3xl mx-auto w-full";
  }
  if (count === 4) {
    return "gap-6 sm:grid-cols-2 max-w-4xl mx-auto w-full";
  }
  return "gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto w-full";
}

function getMinPriceForRoomType(roomType: string, prices: Price[]) {
  let minPrice = Infinity;

  prices.forEach((priceRule) => {
    priceRule.time_slots.forEach((timeSlot) => {
      timeSlot.prices.forEach((roomPrice) => {
        if (roomPrice.room_type === roomType) {
          minPrice = Math.min(minPrice, roomPrice.price);
        }
      });
    });
  });

  return minPrice === Infinity ? 0 : minPrice;
}

export default async function HomeRoomSection() {
  const [rooms, prices] = await Promise.all([getRoomTypes(), getPrices()]);

  const displayRooms = rooms
    .filter((room) => room.type !== "small")
    .sort((a, b) => {
      const typeOrder: Record<string, number> = {
        medium: 1,
        large: 2,
        dorm: 3,
      };
      return (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
    });

  if (displayRooms.length === 0) return null;

  return (
    <section
      id="booking"
      className="glass-surface mb-10 rounded-2xl p-5 sm:mb-16 sm:p-6 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        <MobileSnapSlider
          desktopClassName={roomDesktopLayoutClass(displayRooms.length)}
          slideClassName="w-[88%] max-w-[340px]"
        >
          {displayRooms.map((room: RoomType, index) => {
            const minPrice = getMinPriceForRoomType(room.type, prices);
            return (
              <div
                key={room._id}
                className="min-w-0 h-full"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <RoomCard room={room} minPrice={minPrice} />
              </div>
            );
          })}
        </MobileSnapSlider>
      </div>
    </section>
  );
}
