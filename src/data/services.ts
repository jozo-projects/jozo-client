export type JozoServiceId =
  | "music-box"
  | "netflix"
  | "nintendo-switch"
  | "board-game";

export type JozoService = {
  id: JozoServiceId;
  title: string;
  tagline: string;
  summary: string;
  highlights: string[];
  bookingLabel: string;
  bookingHref: string;
  keywords: string[];
};

export const jozoVenue = {
  name: "JOZO Biên Hòa",
  address: "30 Phan Trung, Tam Hiệp, Biên Hòa, Đồng Nai",
  headline: "Box riêng tư all-in-one tại Biên Hòa",
  intro:
    "JOZO — viết tắt của Joy Zone — là không gian giải trí riêng tư tại Biên Hòa. All-in-one trong một box: hát Music Box, xem Netflix, chơi Nintendo Switch và Board Game. Theo dõi thời gian sử dụng, chương trình thành viên, order đồ ăn ngay trên tablet. Mọi thứ luôn minh bạch — không thuế, không phí dịch vụ phát sinh.",
};

export const jozoServices: JozoService[] = [
  {
    id: "music-box",
    title: "Music Box",
    tagline: "Box riêng tư — chỉ có nhóm mình",
    summary:
      "Box riêng tư chỉ có nhóm mình. S-Box 1–5 người, L-Box 6–8 người với 4 mic sẵn. Theo dõi thời gian sử dụng, order đồ ăn trên tablet, chương trình thành viên. Giá all-in-one — không thuế, không phí dịch vụ phát sinh.",
    highlights: [
      "Box riêng tư · S-Box 1–5 · L-Box 6–8 người",
      "Theo dõi thời gian sử dụng ngay trong phòng",
      "Order đồ ăn & nước trên tablet",
      "Giá all-in-one — không thuế, không phí dịch vụ",
    ],
    bookingLabel: "Đặt box",
    bookingHref: "/#booking",
    keywords: [
      "music box biên hòa",
      "box riêng tư",
      "box riêng tư biên hòa",
      "đặt phòng music box",
      "không thuế không phí dịch vụ",
      "order đồ ăn tablet",
    ],
  },
  {
    id: "netflix",
    title: "Netflix",
    tagline: "Xem phim / series chill cùng nhóm",
    summary:
      "Góc xem Netflix tại JOZO — chọn phim hoặc series yêu thích, ngồi chill cùng bạn bè. Kết hợp snack và nước uống tại quán. Phù hợp nhóm muốn thư giãn, không cần mang thiết bị theo.",
    highlights: [
      "Xem Netflix tại quán",
      "Phù hợp nhóm chill / thư giãn",
      "Kết hợp snack & nước uống",
      "Không cần mang thiết bị theo",
    ],
    bookingLabel: "Ghé JOZO",
    bookingHref: "/#booking",
    keywords: [
      "netflix biên hòa",
      "xem netflix tại quán",
      "xem phim biên hòa",
      "chill xem phim biên hòa",
    ],
  },
  {
    id: "nintendo-switch",
    title: "Nintendo Switch",
    tagline: "Khu Dorm — chơi game chung",
    summary:
      "Khu chơi Nintendo Switch chung, không phải phòng kín. Mang theo bạn bè, chọn game và chơi thoải mái. Phù hợp nhóm 2–4 người, tính giờ theo bảng giá Dorm.",
    highlights: [
      "Khu chung, không phải phòng riêng",
      "Nintendo Switch sẵn tại quán",
      "Phù hợp nhóm 2–4 người",
      "Tính giờ theo bảng giá Dorm",
    ],
    bookingLabel: "Đặt Dorm",
    bookingHref: "/dorm",
    keywords: ["nintendo switch biên hòa", "chơi game tại quán", "dorm jozo"],
  },
  {
    id: "board-game",
    title: "Board Game",
    tagline: "Ngồi chơi tại quán — không cần mang theo",
    summary:
      "Board game có sẵn tại JOZO: Uno, Ma Sói và nhiều tựa khác tùy đợt. Gọi đồ uống, ngồi chơi cùng bạn bè. Không cần đặt trước — ghé quán là chơi được.",
    highlights: [
      "Uno, Ma Sói và nhiều tựa khác",
      "Có sẵn tại quán, không cần mang theo",
      "Không cần đặt trước",
      "Kết hợp snack & nước uống tại chỗ",
    ],
    bookingLabel: "Ghé JOZO",
    bookingHref: "/#booking",
    keywords: ["board game biên hòa", "uno", "ma sói"],
  },
];

export const jozoServicesSeoDescription =
  "JOZO Biên Hòa — box riêng tư all-in-one: theo dõi thời gian sử dụng, thành viên, order đồ ăn trên tablet. Minh bạch — không thuế, không phí dịch vụ phát sinh. 30 Phan Trung, Tam Hiệp.";

export const jozoServicesFaq = [
  {
    question: "JOZO có nghĩa là gì?",
    answer:
      "JOZO là viết tắt của Joy Zone — không gian giải trí riêng tư all-in-one tại Biên Hòa: hát, xem phim, chơi game và order đồ ăn trong cùng một box, mọi thứ luôn minh bạch.",
  },
  {
    question: "JOZO có những dịch vụ gì?",
    answer:
      "JOZO là tổ hợp giải trí riêng tư tại Biên Hòa: music box, xem Netflix, khu Nintendo Switch (Dorm) và board game. All-in-one — theo dõi thời gian sử dụng, thành viên và order trên tablet.",
  },
  {
    question: "Music box tại JOZO có gì?",
    answer:
      "Box riêng tư chỉ có nhóm mình — S-Box 1–5 người, L-Box 6–8 người với 4 mic sẵn. Theo dõi thời gian sử dụng, order đồ ăn trên tablet. Giá all-in-one, không thuế, không phí dịch vụ phát sinh.",
  },
  {
    question: "Có theo dõi thời gian sử dụng không?",
    answer:
      "Có. JOZO hiển thị thời gian sử dụng ngay trong box để nhóm luôn nắm giờ còn lại — minh bạch, không bị tính thêm ngoài khung đã đặt.",
  },
  {
    question: "Order đồ ăn tại JOZO thế nào?",
    answer:
      "Bạn order đồ ăn và nước ngay trên tablet trong phòng, không cần ra quầy. Giá hiển thị rõ ràng trên tablet — không phụ thu thuế hay phí dịch vụ.",
  },
  {
    question: "Chương trình thành viên JOZO là gì?",
    answer:
      "Đăng ký thành viên để quản lý lịch sử sử dụng, nhận ưu đãi và tích điểm. Mọi quyền lợi đều minh bạch trên tài khoản — không thuế, không phí dịch vụ phát sinh.",
  },
  {
    question: "JOZO có xem Netflix không?",
    answer:
      "Có. JOZO có góc xem Netflix để nhóm bạn ngồi chill, chọn phim hoặc series — kết hợp snack và đồ uống order trên tablet, không cần mang thiết bị theo.",
  },
  {
    question: "Giá tại JOZO có thuế hay phí dịch vụ không?",
    answer:
      "Không. Giá trên bảng giá là giá all-in-one bạn trả — không thuế, không phí dịch vụ, không phụ thu phát sinh.",
  },
  {
    question: "Dorm Nintendo Switch là gì?",
    answer:
      "Dorm là khu chơi Nintendo Switch chung tại JOZO — không phải phòng box riêng. Bạn đi nhóm, chọn game và chơi thoải mái. Giá tính theo giờ trên bảng giá Dorm, không thuế hay phí dịch vụ thêm.",
  },
  {
    question: "Board game có cần đặt trước không?",
    answer:
      "Không cần đặt trước. JOZO có sẵn board game như Uno, Ma Sói tại quán — ghé và chơi tại chỗ, kết hợp đồ uống và snack order trên tablet.",
  },
];

export const jozoServicesKeywords = [
  "jozo biên hòa",
  "box riêng tư biên hòa",
  "all in one biên hòa",
  "thành viên jozo",
  "theo dõi thời gian sử dụng",
  "tổ hợp giải trí biên hòa",
  ...jozoServices.flatMap((service) => service.keywords),
];

export function buildJozoServicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EntertainmentBusiness",
        "@id": "https://jozo.com.vn/gioi-thieu#business",
        name: jozoVenue.name,
        description: jozoServicesSeoDescription,
        url: "https://jozo.com.vn/gioi-thieu",
        address: {
          "@type": "PostalAddress",
          streetAddress: "30 Phan Trung",
          addressLocality: "Tam Hiệp, Biên Hòa",
          addressRegion: "Đồng Nai",
          addressCountry: "VN",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dịch vụ giải trí all-in-one tại JOZO",
          itemListElement: jozoServices.map((service, index) => ({
            "@type": "Offer",
            position: index + 1,
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.summary,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://jozo.com.vn/gioi-thieu#faq",
        mainEntity: jozoServicesFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
