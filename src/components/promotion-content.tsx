import Image from "next/image";
import Typography from "./ui/typography";

type PromotionContentProps = {
  promotionId: string;
};

export default function PromotionContent({
  promotionId,
}: PromotionContentProps) {
  // Render content dựa vào promotion ID
  if (promotionId === "7") {
    return (
      <div className="space-y-6">
        <Typography
          as="h1"
          variant="bold"
          className="text-2xl text-foreground mb-4 sm:text-3xl"
        >
          Đăng ký thành viên Jozo — Giảm ngay 10%
        </Typography>

        <div className="relative w-full rounded-xl overflow-hidden border border-white/15 shadow-lg my-6">
          <Image
            src="/images/member-poster-final.webp"
            alt="Poster chương trình thành viên Jozo — giảm ngay 10%"
            width={1086}
            height={1448}
            className="object-contain w-full h-auto"
            priority
          />
        </div>

        <div className="bg-accent/60 border-l-4 border-primary p-4 rounded-r-lg">
          <Typography
            as="p"
            variant="semibold"
            className="text-base leading-relaxed text-foreground sm:text-lg"
          >
            Từ ngày <strong>10/7/2026</strong>, Jozo mở chương trình thành viên
            — đăng ký để nhận <strong>giảm ngay 10%</strong> và hàng loạt ưu
            đãi hấp dẫn.
          </Typography>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            ✨ Quyền lợi thành viên
          </Typography>
          <ul className="space-y-3 text-primary/80">
            <li>
              <strong>🎂 Ưu đãi sinh nhật:</strong> quà và ưu đãi đặc biệt dành
              riêng cho ngày sinh nhật của bạn.
            </li>
            <li>
              <strong>⭐ Tích điểm thành viên:</strong> mỗi lần sử dụng dịch vụ
              đều được cộng điểm vào tài khoản.
            </li>
            <li>
              <strong>⬆️ Thăng hạng nhận ưu đãi:</strong> càng tích điểm càng
              lên hạng — mở khóa thêm nhiều quyền lợi.
            </li>
            <li>
              <strong>🎁 Đủ 3 / 5 / 10 lần nhận quà:</strong> ghé đủ số lần để
              nhận quà hấp dẫn theo từng mốc.
            </li>
            <li>
              <strong>🍟 Tặng snack, nước &amp; phút miễn phí:</strong> nhận
              snack, nước uống và miễn phí đến 20 phút theo chương trình.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            📌 Lưu ý
          </Typography>
          <ul className="list-disc list-inside space-y-2 text-primary/80">
            <li>Chương trình chính thức áp dụng từ ngày 10/7/2026.</li>
            <li>
              Ưu đãi giảm 10% và các quyền lợi khác theo quy định tại quầy / trên
              hệ thống thành viên.
            </li>
            <li>Ưu đãi giảm 10% không áp dụng cho các ngày lễ.</li>
            <li>Không quy đổi ưu đãi thành tiền mặt.</li>
            <li>
              Chi tiết điều kiện có thể thay đổi; vui lòng liên hệ hotline hoặc
              nhân viên lễ tân khi đến cửa hàng.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            📞 Liên hệ
          </Typography>
          <Typography
            as="p"
            variant="default"
            className="text-primary/80 leading-relaxed"
          >
            <strong>Hotline:</strong> 035 966 0934
            <br />
            <strong>Địa chỉ:</strong> 30 Phan Trung, P. Tam Hiệp, Đồng Nai
          </Typography>
        </div>
      </div>
    );
  }

  if (promotionId === "6") {
    return (
      <div className="space-y-6">
        <Typography
          as="h1"
          variant="bold"
          className="text-2xl text-foreground mb-4 sm:text-3xl"
        >
          🔥 Giảm ngay 20% giờ hát/Nintendo từ 20/4 – 24/4
        </Typography>

        <div className="relative w-full rounded-xl overflow-hidden border-2 border-red-200 shadow-lg my-6">
          <Image
            src="/images/disscount-20.jpg"
            alt="Jozo giảm 20% giờ hát và chơi Nintendo từ 20/4 đến 24/4"
            width={1200}
            height={1600}
            className="object-contain w-full h-auto"
            priority
          />
        </div>

        <div className="bg-accent/60 border-l-4 border-primary p-4 rounded-r-lg">
          <Typography
            as="p"
            variant="semibold"
            className="text-base leading-relaxed text-foreground sm:text-lg"
          >
            Nhân dịp Jozo quay trở lại với phiên bản{" "}
            <strong>“tiện nghi hơn”</strong> – phòng nhiều, rộng rãi, thêm nhiều
            dịch vụ để khách iu xả stress mà không lo về túi tiền 😎
          </Typography>
        </div>

        <div className="rounded-r-xl border-l-4 border-primary bg-primary/15 p-4">
          <Typography
            as="p"
            variant="semibold"
            className="text-lg leading-relaxed text-foreground"
          >
            💥 Jozo gửi tặng khách iu: <strong>GIẢM NGAY 20%</strong> giờ hát
            &amp; chơi Nintendo.
            <br />
            ⏰ Áp dụng từ: <strong>20/4 – 24/4</strong> – tất cả khung giờ,
            không cần điều kiện.
          </Typography>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            ✨ Có gì tại Jozo?
          </Typography>
          <ul className="space-y-3 text-primary/80">
            <li>
              <strong>🎤 Phòng rộng rãi – hát cực đã:</strong> không gian thoải
              mái, đi nhóm vẫn dư chỗ quẩy.
            </li>
            <li>
              <strong>🎮 Nintendo chơi “đắm đuối”:</strong> ngồi một cái là
              quên thời gian luôn 😆
            </li>
            <li>
              <strong>🎙 4 MIC cho phòng lớn:</strong> đi đông không lo giành
              mic – ai cũng có phần.
            </li>
            <li>
              <strong>🍟 Menu snack &amp; nước uống đầy đủ:</strong> chơi là
              phải có đồ ăn kèm mới đúng bài.
            </li>
            <li>
              <strong>🎁 Gắp thú – thử vận may:</strong> biết đâu hôm đó bạn
              “trúng lớn” 🧸
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            📌 Lưu ý
          </Typography>
          <ul className="list-disc list-inside space-y-2 text-primary/80">
            <li>Áp dụng cho tất cả khung giờ từ 20/4 – 24/4.</li>
            <li>Không cần điều kiện – cứ tới là được giảm.</li>
            <li>
              Ưu đãi áp dụng cho giờ hát và giờ chơi Nintendo, không quy đổi
              thành tiền mặt.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            📞 Liên hệ đặt phòng
          </Typography>
          <Typography
            as="p"
            variant="default"
            className="text-primary/80 leading-relaxed"
          >
            <strong>Hotline:</strong> 0359 660 934
            <br />
            <strong>Địa chỉ:</strong> 30 Phan Trung, P. Tam Hiệp, Đồng Nai
          </Typography>
        </div>
      </div>
    );
  }

  if (promotionId === "5") {
    return (
      <div className="space-y-6">
        <Typography
          as="h1"
          variant="bold"
          className="text-2xl text-foreground mb-4 sm:text-3xl"
        >
          Nhân dịp Jozo comeback: Khách iu được tặng 2 giờ hát miễn phí
        </Typography>

        <div className="bg-accent/55 border-l-4 border-primary p-4 rounded-r-lg">
          <Typography
            as="p"
            variant="semibold"
            className="text-base leading-relaxed text-foreground sm:text-lg"
          >
            Nhân dịp Jozo comeback, khách iu sẽ được tặng{" "}
            <strong>2 giờ hát miễn phí</strong> — lời cảm ơn chân thành từ Jozo
            tới cả nhà mình đã đồng hành và chờ đợi.
          </Typography>
        </div>

        <Typography
          as="p"
          variant="default"
          className="text-primary/80 leading-relaxed"
        >
          Hãy đặt chỗ sớm qua website hoặc hotline để giữ slot; Jozo sẽ hỗ trợ
          khách iu xác nhận ưu đãi comeback khi tới quán.
        </Typography>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            Ghi nhận nhanh
          </Typography>
          <ul className="list-disc list-inside space-y-2 text-primary/80">
            <li>
              Ưu đãi áp dụng theo quy định tại quầy và trong thời gian chương
              trình.
            </li>
            <li>Giờ hát tặng không quy đổi thành tiền mặt.</li>
            <li>
              Chi tiết điều kiện cụ thể vui lòng liên hệ hotline hoặc nhân viên
              lễ tân khi đến cửa hàng.
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Typography
            as="h3"
            variant="semibold"
            className="text-xl text-foreground mb-3"
          >
            Liên hệ đặt
          </Typography>
          <Typography
            as="p"
            variant="default"
            className="text-primary/80 leading-relaxed"
          >
            <strong>Hotline:</strong> 035 966 0934
            <br />
            <strong>Địa chỉ:</strong> 30 Phan Trung, Tam Hiệp, Đồng Nai
          </Typography>
        </div>
      </div>
    );
  }

  // Default fallback cho promotion khác
  return (
    <Typography as="p" variant="default" className="text-primary/80">
      Nội dung khuyến mãi đang được cập nhật...
    </Typography>
  );
}
