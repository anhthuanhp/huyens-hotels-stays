import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
};

type HotelSEO = {
  slug: string;
  name_vi: string | null;
  name_en: string | null;
  address_vi: string | null;
  address_en: string | null;
  description_vi: string | null;
  description_en: string | null;
  image: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  google_business_url: string | null;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://huyenstays.vercel.app";

function cleanText(
  value: string | null | undefined
): string {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createDescription(
  hotel: HotelSEO
): string {
  const description =
    cleanText(hotel.description_vi);

  const address =
    cleanText(hotel.address_vi);

  const name =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Huyen's Hotels & Stays";

  let result = description;

  if (!result) {
    result =
      `${name} tại ${
        address || "TP. Hồ Chí Minh"
      }. Đặt phòng trực tiếp tại Huyen's Hotels & Stays.`;
  } else if (
    address &&
    !result.includes(address)
  ) {
    result = `${result} ${address}.`;
  }

  if (result.length > 160) {
    result =
      `${result.slice(0, 157).trim()}...`;
  }

  return result;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { slug } = await params;

  const canonicalUrl =
    `${siteUrl.replace(/\/$/, "")}/khach-san/${slug}`;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return {
      title:
        "Khách sạn | Huyen's Hotels & Stays",

      description:
        "Khách sạn và nơi lưu trú tại TP. Hồ Chí Minh. Đặt phòng trực tiếp tại Huyen's Hotels & Stays.",

      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  const { data: hotel } = await supabase
    .from("hotels")
    .select(
      [
        "slug",
        "name_vi",
        "name_en",
        "address_vi",
        "address_en",
        "description_vi",
        "description_en",
        "image",
        "status",
        "latitude",
        "longitude",
        "map_url",
        "google_business_url",
      ].join(", ")
    )
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!hotel) {
    return {
      title:
        "Không tìm thấy khách sạn | Huyen's Hotels & Stays",

      description:
        "Không tìm thấy thông tin cơ sở lưu trú này.",

      robots: {
        index: false,
        follow: true,
      },

      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  const hotelData =
    hotel as unknown as HotelSEO;

  const nameVi =
    cleanText(hotelData.name_vi) ||
    cleanText(hotelData.name_en) ||
    "Khách sạn";

  const nameEn =
    cleanText(hotelData.name_en) ||
    nameVi;

  const addressVi =
    cleanText(hotelData.address_vi);

  const description =
    createDescription(hotelData);

  const title =
    `${nameVi} | Huyen's Hotels & Stays`;

  const englishTitle =
    `${nameEn} | Huyen's Hotels & Stays`;

  const images = hotelData.image
    ? [
        {
          url: hotelData.image,
          alt: nameVi,
        },
      ]
    : undefined;

  return {
    title,

    description,

    keywords: [
      nameVi,
      nameEn,
      `${nameVi} Quận 1`,
      `${nameVi} TP.HCM`,
      `${nameVi} Hồ Chí Minh`,
      "khách sạn Quận 1",
      "khách sạn TP.HCM",
      "khách sạn Hồ Chí Minh",
      "Huyen's Hotels & Stays",
    ],

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: canonicalUrl,
      siteName: "Huyen's Hotels & Stays",
      title,
      description,
      images,
    },

    twitter: {
      card: hotelData.image
        ? "summary_large_image"
        : "summary",

      title: englishTitle,
      description,

      images: hotelData.image
        ? [hotelData.image]
        : undefined,
    },

    other: {
      "hotel-name": nameVi,
      "hotel-address": addressVi,
    },
  };
}

function HotelStructuredData({
  hotel,
  canonicalUrl,
}: {
  hotel: HotelSEO;
  canonicalUrl: string;
}) {
  const name =
    cleanText(hotel.name_vi) ||
    cleanText(hotel.name_en) ||
    "Khách sạn";

  const description =
    cleanText(hotel.description_vi) ||
    cleanText(hotel.description_en) ||
    `${name} tại TP. Hồ Chí Minh.`;

  const address =
    cleanText(hotel.address_vi) ||
    cleanText(hotel.address_en);

  const hotelSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Hotel",

    "@id": `${canonicalUrl}#hotel`,

    name,

    url: canonicalUrl,

    description,

    brand: {
      "@type": "Brand",
      name: "Huyen's Hotels & Stays",
    },

    publisher: {
      "@type": "Organization",
      name: "Huyen's Hotels & Stays",
      url: siteUrl,
    },

    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Ho Chi Minh City",
      addressRegion: "Ho Chi Minh City",
      addressCountry: "VN",
    },
  };

  if (hotel.image) {
    hotelSchema.image = [hotel.image];
  }

  if (
    hotel.latitude !== null &&
    hotel.longitude !== null &&
    Number.isFinite(Number(hotel.latitude)) &&
    Number.isFinite(Number(hotel.longitude))
  ) {
    hotelSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(hotel.latitude),
      longitude: Number(hotel.longitude),
    };
  }

  if (hotel.map_url) {
    hotelSchema.hasMap = hotel.map_url;
  }

  if (hotel.google_business_url) {
    hotelSchema.sameAs = [
      hotel.google_business_url,
    ];
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            hotelSchema
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema
          ),
        }}
      />
    </>
  );
}

export default async function HotelSlugLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;

  let structuredDataHotel: HotelSEO | null =
    null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );

    const { data: hotel } = await supabase
      .from("hotels")
      .select(
        [
          "slug",
          "name_vi",
          "name_en",
          "address_vi",
          "address_en",
          "description_vi",
          "description_en",
          "image",
          "status",
          "latitude",
          "longitude",
          "map_url",
          "google_business_url",
        ].join(", ")
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (hotel) {
      structuredDataHotel =
        hotel as unknown as HotelSEO;
    }
  }

  const canonicalUrl =
    `${siteUrl.replace(/\/$/, "")}/khach-san/${slug}`;

  return (
    <>
      {structuredDataHotel && (
        <HotelStructuredData
          hotel={structuredDataHotel}
          canonicalUrl={canonicalUrl}
        />
      )}

      {children}
    </>
  );
}