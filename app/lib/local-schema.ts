import { SITE_URL } from "./seo";

// Historical district name used by guests; retain the property's actual address.
export const districtOnePlace = {
  "@type": "Place", "@id": SITE_URL + "/khach-san-quan-1-cu#place",
  name: "Quận 1 cũ, Sài Gòn", alternateName: "District 1, Saigon",
  containedInPlace: {
    "@type": "City", name: "Thành phố Hồ Chí Minh", alternateName: "Sài Gòn",
    containedInPlace: { "@type": "Country", name: "Việt Nam" },
  },
};
