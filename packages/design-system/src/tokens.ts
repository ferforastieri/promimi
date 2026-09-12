/**
 * Product UI foundations. These values deliberately follow the compact, soft
 * operational interface used by both Promimi applications.
 */
export const designTokens = {
  color: {
    ink: "#252936",
    muted: "#737b8c",
    canvas: "#f6f7fb",
    surface: "#ffffff",
    line: "#e8ebf1",
    accent: "#ee4d2d",
    accentStrong: "#d83b1d",
    success: "#20b66f",
    danger: "#e05260",
    info: "#3574ed",
  },
  radius: { control: "12px", card: "20px", app: "28px", pill: "999px" },
} as const;
