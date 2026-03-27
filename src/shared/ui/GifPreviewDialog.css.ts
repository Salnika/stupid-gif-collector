import { style } from "@vanilla-extract/css";
import { vars } from "../styles/theme.css";

export const backdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 140,
  display: "grid",
  placeItems: "center",
  padding: "1.2rem",
  background: "transparent",
  backdropFilter: "none",
});

export const panel = style({
  position: "relative",
  display: "grid",
  justifyItems: "center",
  gap: vars.space.sm,
  padding: "1rem",
  borderRadius: "1.35rem",
  border: "1px solid rgba(255, 244, 215, 0.16)",
  background: "transparent",
  boxShadow: "0 26px 48px rgba(0, 0, 0, 0.2)",
  selectors: {
    '&[data-refractive="fallback"]': {
      backgroundColor: "rgba(7, 14, 26, 0.68)",
    },
  },
});

export const closeButton = style({
  position: "absolute",
  top: "0.7rem",
  right: "0.7rem",
  zIndex: 2,
  width: "2.3rem",
  height: "2.3rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(8, 14, 24, 0.72)",
  color: vars.color.text,
  cursor: "pointer",
  selectors: {
    "&:hover": {
      borderColor: vars.color.borderStrong,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.borderStrong}`,
      outlineOffset: "2px",
    },
  },
});

export const card = style({
  position: "relative",
  width: "min(88vw, 340px)",
  aspectRatio: "5 / 7",
  overflow: "hidden",
  borderRadius: "1.18rem",
  boxShadow: `0 0 0 1px ${vars.color.border}, 0 16px 40px rgba(0, 0, 0, 0.46)`,
});

export const image = style({
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  padding: "0.95rem 0.95rem 0 0.95rem",
  objectFit: "contain",
  background:
    "radial-gradient(circle at top, rgba(125, 211, 252, 0.12) 0%, rgba(2, 6, 23, 0) 48%), #020617",
});

export const body = style({
  position: "relative",
  zIndex: 2,
  display: "grid",
  gap: "0.22rem",
  padding: "0.72rem 0.8rem 0.85rem",
  background: "linear-gradient(180deg, rgba(15, 18, 31, 0.92) 0%, rgba(7, 10, 20, 0.98) 100%)",
});

export const topRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.xs,
});

export const number = style({
  margin: 0,
  fontSize: "0.74rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255, 240, 214, 0.64)",
});

export const count = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "1.55rem",
  padding: "0 0.55rem",
  borderRadius: vars.radius.pill,
  background: "rgba(125, 211, 252, 0.16)",
  color: "#dcf2ff",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

export const name = style({
  margin: 0,
  fontSize: "0.92rem",
  lineHeight: 1.4,
  color: vars.color.text,
});

export const collection = style({
  margin: 0,
  fontSize: "0.78rem",
  lineHeight: 1.45,
  color: "rgba(214, 223, 239, 0.7)",
});

export const footer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.xs,
});

export const newBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "1.45rem",
  padding: "0 0.55rem",
  borderRadius: vars.radius.pill,
  background: "rgba(250, 204, 21, 0.18)",
  color: "#fde68a",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

export const actionRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.sm,
});

export const iconActionButton = style({
  width: "2.8rem",
  height: "2.8rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(8, 14, 24, 0.72)",
  color: vars.color.text,
  textDecoration: "none",
  cursor: "pointer",
  transition: "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
  selectors: {
    "&:hover": {
      transform: "translateY(-1px)",
      borderColor: vars.color.borderStrong,
    },
    "&:focus-visible": {
      outline: `2px solid ${vars.color.borderStrong}`,
      outlineOffset: "2px",
    },
  },
});

export const iconActionButtonActive = style({
  borderColor: "rgba(148, 255, 177, 0.8)",
  background: "rgba(24, 41, 31, 0.82)",
  color: "#ecfeff",
});

export const iconActionButtonFavorite = style({
  color: "#ffd95a",
  borderColor: "rgba(253, 230, 138, 0.82)",
  background: "rgba(53, 41, 10, 0.9)",
});

export const icon = style({
  width: "1.08rem",
  height: "1.08rem",
  display: "block",
});
