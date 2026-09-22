import { RecruitmentForm } from "@/components/recruitment-form";
import Link from "next/link";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-primary/10 py-6 last:border-0 last:pb-0">
      <h3 className="card-title mb-3">{title}</h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="body-copy list-inside list-disc space-y-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function RecruitmentPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="page-title">Jozo tìm đồng đội</h1>
        </header>

        <div className="mb-8 glass-surface rounded-2xl p-5 sm:p-6">
          <h2 className="section-title mb-1">
            Mô tả công việc
          </h2>
          <p className="section-lede mb-6">
            Hình thức: Part-time. Không yêu cầu kinh nghiệm — sẽ được đào tạo
            nội quy và nghiệp vụ tại chỗ.
          </p>

          <Section title="Yêu cầu chung">
            <BulletList
              items={[
                "Độ tuổi: 18–25.",
                "Trung thực, có trách nhiệm, chủ động trong công việc.",
                "Giao tiếp lịch sự, thái độ tốt, nhiệt tình",
                "Linh hoạt ca làm; ưu tiên ứng viên phối hợp tốt trong nhóm.",
                "Có thể làm nhiều vị trí khác nhau.",
                "Có thể làm việc vào các ngày lễ",
                "Biết chơi game console (PS5, XBOX, NINTENDO, ...) và Board Game (Uno, Ma sói, ...) là một lợi thế.",
              ]}
            />
          </Section>

          <Section title="Lễ tân">
            <BulletList
              items={[
                "Đón tiếp khách, tư vấn và báo giá",
                "Sắp xếp và phân bổ phòng hợp lý.",
                "Tiếp nhận thông tin đặt phòng và hỗ trợ khách hàng qua các kênh được giao.",
                "Thu ngân, xử lý thanh toán sau khi khách sử dụng dịch vụ.",
                "Hỗ trợ đồng nghiệp trong giờ cao điểm",
              ]}
            />
          </Section>

          <Section title="Phục vụ">
            <BulletList
              items={[
                "Chuẩn bị thiết bị trước khi khách vào.",
                "Dẫn khách vào phòng, hướng dẫn sử dụng thiết bị cơ bản.",
                "Dọn dẹp phòng/khu vực sau các phiên sử dụng.",
                "Đảm bảo vệ sinh khu vực chung theo checklist.",
                "Hỗ trợ xử lý kỹ thuật và điều chỉnh thiết bị theo yêu cầu từ phía khách hàng",
                "Phối hợp ca trực khi lượng khách tăng.",
                "Chuẩn bị đồ uống/món ăn theo order của khách",
              ]}
            />
          </Section>

          <Section title="Giữ xe">
            <BulletList
              items={[
                "Bảo đảm sự an toàn của xe khách.",
                "Hỗ trợ dắt xe cho khách",
                "Sắp xếp xe gọn gàng, giám sát khu vực được phân công.",
                "Duy trì vệ sinh và trật tự nơi giữ xe.",
                "Phối hợp lễ tân cập nhật tình trạng phòng khi khách đến.",
              ]}
            />
          </Section>

          <Section title="Chính sách lương">
            <ul className="body-copy space-y-2">
              <li>
                <span className="font-medium text-foreground">Lương:</span>{" "}
                24.000 VNĐ/giờ
              </li>
            </ul>
          </Section>
        </div>

        <RecruitmentForm />

        <footer className="body-copy mt-10 border-t border-white/10 pt-8 text-center">
          <p>
            Liên hệ:{" "}
            <Link
              href="tel:0336051204"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              033 605 1204
            </Link>
            {" · "}
            <Link
              href="mailto:jozostudiollc@gmail.com"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              jozostudiollc@gmail.com
            </Link>
          </p>
          <p className="mt-2">
            Địa chỉ làm việc:{" "}
            <Link
              href="https://www.google.com/maps/place/Jozo+Music+Box/@10.9615421,106.8471298,1234m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3174dd6fa7fe3c73:0xac4d7af01bc4f800!8m2!3d10.9615421!4d106.8520007!16s%2Fg%2F11m64vjf12?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              30 Phan Trung, Tân Mai, Đồng Nai
            </Link>
          </p>
          <p className="mt-4 text-xs text-primary/55">
            Dữ liệu ứng tuyển chỉ phục vụ tuyển dụng và được bảo mật theo nội
            quy xử lý thông tin cá nhân của đơn vị.
          </p>
        </footer>
    </div>
  );
}
