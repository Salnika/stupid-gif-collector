import { style } from "@vanilla-extract/css";
import { vars } from "../shared/styles/theme.css";

export const nav = style({
  position: "fixed",
  top: "clamp(0.8rem, 2vw, 1.2rem)",
  left: "clamp(0.8rem, 2vw, 1.2rem)",
  display: "flex",
  gap: vars.space.xs,
  zIndex: 120,
});

export const navButton = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "2rem",
  padding: "0 0.72rem",
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelMuted,
  color: "rgba(241, 245, 249, 0.92)",
  textDecoration: "none",
  fontSize: "0.78rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  transition: "background-color 160ms ease, border-color 160ms ease, color 160ms ease",
  selectors: {
    "&:hover": {
      background: "rgba(15, 22, 36, 0.88)",
      borderColor: vars.color.borderStrong,
      color: "#f8fafc",
    },
  },
});

export const navButtonActive = style({
  borderColor: "rgba(148, 255, 177, 0.8)",
  background: "rgba(24, 41, 31, 0.82)",
  color: "#ecfeff",
});

export const navToggleButton = style([
  {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "5.35rem",
    minWidth: "5.35rem",
    height: "1.8rem",
    minHeight: "1.8rem",
    padding: 0,
    borderRadius: vars.radius.pill,
    border: `1px solid rgba(255, 255, 255, 0.14)`,
    background:
      "linear-gradient(180deg, rgba(226, 232, 240, 0.22) 0%, rgba(203, 213, 225, 0.14) 100%)",
    boxShadow: "0 16px 34px rgba(0, 0, 0, 0.12)",
    fontFamily: "inherit",
    appearance: "none",
    overflow: "visible",
    cursor: "pointer",
    transition:
      "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
    selectors: {
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 0.22)",
        boxShadow: "0 18px 38px rgba(0, 0, 0, 0.16)",
      },
      "&:focus-visible": {
        outline: `2px solid ${vars.color.borderStrong}`,
        outlineOffset: "2px",
      },
    },
  },
]);

export const navToggleButtonActive = style([
  {
    borderColor: "rgba(173, 212, 255, 0.86)",
    background:
      "linear-gradient(180deg, rgba(157, 201, 248, 0.92) 0%, rgba(138, 188, 243, 0.82) 100%)",
    boxShadow: "0 18px 36px rgba(77, 125, 186, 0.18)",
  },
]);

export const navToggleLabel = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingBottom: "0.02rem",
  transform: "translateX(0.84rem)",
  color: "rgba(255, 255, 255, 0.74)",
  fontSize: "0.64rem",
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  textShadow: "0 1px 10px rgba(9, 14, 25, 0.14)",
  pointerEvents: "none",
  transition: "transform 180ms ease, color 180ms ease",
  userSelect: "none",
});

export const navToggleLabelActive = style({
  transform: "translateX(-0.84rem)",
  color: "rgba(255, 255, 255, 0.84)",
});

export const navToggleThumb = style({
  position: "absolute",
  top: "50%",
  left: "-0.14rem",
  width: "2.28rem",
  height: "2.28rem",
  display: "block",
  pointerEvents: "none",
  filter: "drop-shadow(0 16px 28px rgba(0, 0, 0, 0.18))",
  transform: "translate3d(0, -50%, 0) scale(1)",
  transition: "transform 280ms cubic-bezier(0.22, 1.3, 0.36, 1), filter 220ms ease",
});

export const navToggleThumbActive = style({
  filter: "drop-shadow(0 18px 30px rgba(77, 125, 186, 0.2))",
  transform: "translate3d(3.22rem, -50%, 0) scale(1.02)",
});

export const navToggleThumbSurface = style({
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  border: "1px solid rgba(255, 255, 255, 0.38)",
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(241, 245, 249, 0.5) 100%)",
  boxShadow:
    "inset 0 1px 1px rgba(255, 255, 255, 0.46), inset 0 -8px 16px rgba(148, 163, 184, 0.12)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  selectors: {
    '&[data-refractive="enabled"]': {
      background: "transparent",
      borderColor: "rgba(255, 255, 255, 0.28)",
      boxShadow: "none",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
    },
    '&[data-refractive="fallback"]': {
      background:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(241, 245, 249, 0.56) 100%)",
    },
  },
});

export const visuallyHidden = style({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

export const githubLink = style({
  position: "fixed",
  top: "clamp(0.8rem, 2vw, 1.2rem)",
  right: "clamp(0.8rem, 2vw, 1.2rem)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.12rem",
  height: "2.12rem",
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelMuted,
  color: "#fff",
  zIndex: 120,
  transition: "background-color 160ms ease, border-color 160ms ease",
  selectors: {
    "&:hover": {
      background: "rgba(15, 22, 36, 0.88)",
      borderColor: vars.color.borderStrong,
    },
  },
});

export const githubIcon = style({
  width: "1.16rem",
  height: "1.16rem",
  display: "block",
});
