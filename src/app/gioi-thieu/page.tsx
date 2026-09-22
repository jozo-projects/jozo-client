import AboutServicesPage from "@/components/about-services-page";
import {
  buildJozoServicesJsonLd,
  jozoServicesKeywords,
  jozoServicesSeoDescription,
} from "@/data/services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Giới thiệu | JOZO Biên Hòa — Box riêng tư all-in-one, không thuế phí dịch vụ",
  description: jozoServicesSeoDescription,
  keywords: jozoServicesKeywords,
  alternates: { canonical: "/gioi-thieu" },
  openGraph: {
    title: "Giới thiệu JOZO Biên Hòa — Box riêng tư all-in-one",
    description: jozoServicesSeoDescription,
    url: "/gioi-thieu",
    images: ["/images/jozo-thumbnail.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giới thiệu JOZO Biên Hòa — Box riêng tư all-in-one",
    description: jozoServicesSeoDescription,
    images: ["/images/jozo-thumbnail.jpg"],
  },
};

export default function AboutPage() {
  const jsonLd = buildJozoServicesJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-5xl">
        <AboutServicesPage />
      </div>
    </>
  );
}
