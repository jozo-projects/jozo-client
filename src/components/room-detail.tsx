import Image from "next/image";
import React from "react";

type RoomData = {
  name: string; // Tên box
  description: string; // Mô tả box
  price: number; // Giá gốc của box
  discountedPrice: number; // Giá đã giảm của box
  amenities: string[]; // Danh sách tiện ích
  images: string[]; // Danh sách URL hình ảnh
};

interface RoomDetailProps {
  roomData: RoomData; // Dữ liệu chi tiết của box
}

const RoomDetail: React.FC<RoomDetailProps> = ({ roomData }) => {
  return (
    <div className="glass-surface mx-auto max-w-4xl rounded-2xl p-6">
      {/* Room Name */}
      <h1 className="page-title mb-4">{roomData.name}</h1>

      {/* Room Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {roomData.images.map((image, index) => (
          <div
            key={index}
            className="relative w-full aspect-w-4 aspect-h-3 overflow-hidden rounded-lg"
          >
            <Image
              src={image}
              alt={`Room image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Room Description */}
      <p className="body-copy mb-4">{roomData.description}</p>

      {/* Pricing */}
      <p className="text-lg font-semibold text-foreground mb-4">
        Price:{" "}
        <span className="line-through text-primary/55">
          {roomData.price.toLocaleString()} VND
        </span>{" "}
        <span className="text-red-500">
          {roomData.discountedPrice.toLocaleString()} VND
        </span>
      </p>

      {/* Amenities */}
      <ul className="list-disc pl-5">
        <strong className="text-foreground">Amenities:</strong>
        {roomData.amenities.map((amenity, index) => (
          <li key={index} className="text-primary/80">
            {amenity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomDetail;
