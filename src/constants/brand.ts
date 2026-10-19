export const BRAND = {
  name: "Cot & Couch",
  tagline: "Premium teakwood & comfort, curated in Lingampally.",
  shortTagline: "Your digital showroom window",
  city: "Hyderabad",
  locality: "Lingampally",
} as const;

/**
 * logo-light → light mode
 * logo-dark → dark mode (beige)
 * logo-white → optional on dark photo heroes
 * logo-mark-* → house mark cropped from the matching full logo
 * `v` busts Next/browser cache when logo files are replaced in place.
 */
export const LOGOS = {
  light: "/images/logo/logo-light.png?v=2",
  dark: "/images/logo/logo-dark.png?v=2",
  white: "/images/logo/logo-white.png?v=2",
  markLight: "/images/logo/logo-mark-light.png?v=1",
  markDark: "/images/logo/logo-mark-dark.png?v=1",
  markWhite: "/images/logo/logo-mark-white.png?v=1",
} as const;

export const DEMO = {
  customerOtp: "123456",
  /** Admin console — use these exact values while testing */
  adminMobile: "9391360138",
  adminPassword: "cotandcouch2026",
  /** Optional second role for Team vs Admin UI demo */
  teamMobile: "9876543211",
  teamPassword: "team123",
} as const;
