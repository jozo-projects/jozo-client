// Tạo danh sách khung giờ cố định
const fixedTimeSlots = [
  "06:00 - 08:00",
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
];

export default function TimeSlot({
  selectedDate,
  availableSlots,
  selectedSlots,
  onSelectSlots,
}: {
  selectedDate: string;
  availableSlots: string[];
  selectedSlots: string[];
  onSelectSlots: (slot: string) => void;
}) {
  return (
    <div>
      {/* Grid hiển thị khung giờ */}
      {selectedDate && (
        <div className="mt-4">
          {/* Chú thích */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 glass-control border rounded-sm border-primary/35 block"></span>
              <p className="text-sm">Khả dụng</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-primary/25 border rounded-sm border-primary/30 block"></span>
              <p className="text-sm">Không khả dụng</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-primary border rounded-sm border-primary block"></span>
              <p className="text-sm text-foreground">Đã chọn</p>
            </div>
          </div>

          {/* Hiển thị Grid */}
          <p className="text-primary/70">Chọn khung giờ:</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {fixedTimeSlots.map((slot, index) => {
              const isUnavailable = !availableSlots.includes(slot);
              const isSelected = selectedSlots.includes(slot);

              return (
                <button
                  key={index}
                  disabled={isUnavailable}
                  onClick={() => onSelectSlots(slot)}
                  className={`p-2 rounded-md text-center border ${
                    isUnavailable
                      ? "bg-primary/20 border-primary/25 text-primary/50 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "glass-control border-primary/40 text-foreground"
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
