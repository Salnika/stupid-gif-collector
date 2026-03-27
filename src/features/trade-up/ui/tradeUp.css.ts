import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import { vars } from "../../../shared/styles/theme.css";

const suspenseSpin = keyframes({
  "0%": {
    transform: "rotate(0deg)",
  },
  "100%": {
    transform: "rotate(360deg)",
  },
});

const suspensePulse = keyframes({
  "0%, 100%": {
    opacity: 0.55,
    transform: "scale(0.96)",
  },
  "50%": {
    opacity: 1,
    transform: "scale(1.04)",
  },
});

const confettiBurst = keyframes({
  "0%": {
    opacity: 0,
    transform: "translate(-50%, -50%) scale(0.35) rotate(0deg)",
  },
  "10%": {
    opacity: 1,
  },
  "100%": {
    opacity: 0,
    transform:
      "translate(calc(-50% + var(--confetti-x)), calc(-50% + var(--confetti-y))) scale(1) rotate(var(--confetti-rotate))",
  },
});

export const page = style({
  width: "100%",
  minHeight: "100%",
  backgroundImage: "url('/background.jpg')",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  position: "fixed",
  inset: 0,
  overflowY: "auto",
  padding: "5.4rem clamp(1rem, 4vw, 2.2rem) clamp(1.2rem, 3vw, 1.9rem)",
  "@media": {
    "(max-width: 640px)": {
      paddingTop: "6rem",
    },
  },
});

export const container = style({
  width: "min(1200px, 100%)",
  margin: "0 auto",
  display: "grid",
  gap: vars.space.lg,
});

export const header = style({
  display: "grid",
  gap: vars.space.xs,
});

export const title = style({
  margin: 0,
  fontSize: "clamp(1.35rem, 2.8vw, 2rem)",
  letterSpacing: "0.04em",
  fontFamily: vars.font.display,
});

export const subtitle = style({
  margin: 0,
  maxWidth: "52rem",
  fontSize: "0.92rem",
  color: "rgba(226, 232, 240, 0.88)",
});

export const panel = style({
  padding: vars.space.lg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: "rgba(5, 12, 20, 0.68)",
  boxShadow: "0 18px 48px rgba(0, 0, 0, 0.2)",
  display: "grid",
  gap: vars.space.md,
});

export const controls = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.md,
  alignItems: "flex-end",
});

export const field = style({
  display: "grid",
  gap: "0.35rem",
  minWidth: "240px",
  flex: "1 1 260px",
});

export const label = style({
  fontSize: "0.68rem",
  letterSpacing: "0.11em",
  textTransform: "uppercase",
  color: "rgba(203, 213, 225, 0.86)",
});

export const select = style({
  minHeight: "2.4rem",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(8, 14, 24, 0.82)",
  color: vars.color.text,
  padding: "0.5rem 0.75rem",
});

export const summaryPill = style({
  minHeight: "2.4rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 0.8rem",
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelMuted,
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(241, 245, 249, 0.92)",
});

export const helperText = style({
  margin: 0,
  fontSize: "0.82rem",
  color: "rgba(226, 232, 240, 0.82)",
});

export const tradeBoard = style({
  display: "grid",
  gap: vars.space.md,
  alignItems: "stretch",
  "@media": {
    "(min-width: 981px)": {
      gridTemplateColumns: "minmax(0, 1.8fr) minmax(260px, 0.95fr)",
    },
  },
});

export const sourceColumn = style({
  display: "grid",
  gap: vars.space.sm,
});

export const boardLabel = style({
  margin: 0,
  fontSize: "0.68rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(203, 213, 225, 0.86)",
});

export const slotGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: vars.space.sm,
  "@media": {
    "(max-width: 980px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "(max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const slot = style({
  minHeight: "172px",
  borderRadius: vars.radius.md,
  border: `1px dashed ${vars.color.border}`,
  background: "rgba(8, 14, 24, 0.72)",
  color: vars.color.text,
  padding: vars.space.sm,
  display: "grid",
  alignContent: "space-between",
  gap: vars.space.sm,
});

export const slotButton = style([
  slot,
  {
    width: "100%",
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 160ms ease, transform 160ms ease, background-color 160ms ease",
    selectors: {
      "&:hover": {
        borderColor: vars.color.borderStrong,
        transform: "translateY(-1px)",
      },
    },
  },
]);

export const slotEmpty = style({
  placeItems: "center",
  alignContent: "center",
  textAlign: "center",
  color: "rgba(203, 213, 225, 0.74)",
});

export const slotIndex = style({
  fontSize: "0.68rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(203, 213, 225, 0.7)",
});

export const slotImage = style({
  width: "100%",
  height: "82px",
  objectFit: "cover",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(2, 6, 23, 0.7)",
});

export const slotMeta = style({
  display: "grid",
  gap: "0.2rem",
});

export const slotName = style({
  margin: 0,
  fontSize: "0.82rem",
  fontWeight: 700,
});

export const slotDetails = style({
  margin: 0,
  fontSize: "0.72rem",
  color: "rgba(226, 232, 240, 0.78)",
});

export const slotHint = style({
  margin: 0,
  fontSize: "0.72rem",
  color: "rgba(203, 213, 225, 0.74)",
});

export const targetColumn = style({
  display: "grid",
  gap: vars.space.sm,
});

export const targetSlot = style({
  minHeight: "198px",
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(8, 14, 24, 0.82)",
  padding: vars.space.md,
  display: "grid",
  gap: vars.space.sm,
  alignContent: "start",
});

export const targetHeader = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: vars.space.xs,
  alignItems: "center",
});

export const targetImage = style({
  width: "100%",
  height: "110px",
  objectFit: "cover",
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(2, 6, 23, 0.7)",
});

export const targetPlaceholder = style({
  minHeight: "110px",
  borderRadius: vars.radius.sm,
  border: `1px dashed ${vars.color.border}`,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "rgba(203, 213, 225, 0.76)",
  background: "rgba(2, 6, 23, 0.46)",
});

export const targetName = style({
  margin: 0,
  fontSize: "0.9rem",
  fontWeight: 700,
});

export const targetDetails = style({
  margin: 0,
  fontSize: "0.76rem",
  color: "rgba(226, 232, 240, 0.78)",
});

export const actionRow = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
  alignItems: "center",
});

export const statusMessage = style({
  margin: 0,
  fontSize: "0.84rem",
});

export const statusInfo = style({
  color: vars.color.info,
});

export const statusSuccess = style({
  color: vars.color.success,
});

export const statusError = style({
  color: vars.color.danger,
});

export const suspenseBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 138,
  display: "grid",
  placeItems: "center",
  padding: "1.2rem",
  background: "rgba(2, 6, 23, 0.2)",
  backdropFilter: "blur(4px)",
});

export const suspensePanel = style({
  width: "min(88vw, 320px)",
  padding: "1.1rem 1.15rem",
  borderRadius: "1.35rem",
  border: "1px solid rgba(255, 244, 215, 0.16)",
  background: "rgba(7, 14, 26, 0.68)",
  boxShadow: "0 26px 48px rgba(0, 0, 0, 0.2)",
  display: "grid",
  justifyItems: "center",
  gap: vars.space.sm,
  textAlign: "center",
});

export const suspenseLoaderShell = style({
  position: "relative",
  width: "4.25rem",
  height: "4.25rem",
  display: "grid",
  placeItems: "center",
});

export const suspenseLoaderPulse = style({
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(246, 197, 111, 0.18) 0%, rgba(93, 168, 255, 0.16) 44%, transparent 72%)",
  filter: "blur(8px)",
  animation: `${suspensePulse} 1s ease-in-out infinite`,
});

export const suspenseLoader = style({
  width: "3.1rem",
  height: "3.1rem",
  borderRadius: "50%",
  border: "3px solid rgba(241, 245, 249, 0.16)",
  borderTopColor: vars.color.rarityLegendary,
  borderRightColor: vars.color.rarityRare,
  animation: `${suspenseSpin} 820ms linear infinite`,
});

export const suspenseTitle = style({
  margin: 0,
  fontSize: "1rem",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(248, 250, 252, 0.96)",
});

export const suspenseText = style({
  margin: 0,
  maxWidth: "18rem",
  fontSize: "0.82rem",
  lineHeight: 1.5,
  color: "rgba(226, 232, 240, 0.82)",
});

export const confettiOverlay = style({
  position: "fixed",
  inset: 0,
  zIndex: 141,
  pointerEvents: "none",
  overflow: "hidden",
});

export const confettiPiece = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "0.7rem",
  height: "1rem",
  borderRadius: "999px",
  background: "var(--confetti-color)",
  boxShadow: "0 0 10px rgba(255, 255, 255, 0.18)",
  opacity: 0,
  transform: "translate(-50%, -50%)",
  animation: `${confettiBurst} 1450ms cubic-bezier(0.12, 0.72, 0.22, 1) forwards`,
  animationDelay: "var(--confetti-delay)",
});

export const collectionSection = style({
  padding: vars.space.lg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: "rgba(5, 12, 20, 0.62)",
  display: "grid",
  gap: vars.space.md,
});

export const collectionHeader = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: vars.space.sm,
  alignItems: "flex-end",
});

export const sectionTitle = style({
  margin: 0,
  fontSize: "1rem",
  letterSpacing: "0.04em",
});

export const sectionText = style({
  margin: 0,
  fontSize: "0.84rem",
  color: "rgba(226, 232, 240, 0.82)",
});

export const emptyState = style({
  margin: 0,
  padding: `${vars.space.md} ${vars.space.lg}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: "rgba(8, 14, 24, 0.72)",
  fontSize: "0.9rem",
});

export const grid = style({
  display: "grid",
  gap: "0.9rem",
  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
});

export const gridCard = style({
  transition: "transform 160ms ease, opacity 160ms ease, border-color 160ms ease",
});

export const gridCardSelected = style({
  transform: "translateY(-2px)",
});

export const gridCardDisabled = style({
  opacity: 0.55,
});

export const gridCardFooter = style({
  display: "flex",
  justifyContent: "space-between",
  gap: vars.space.xs,
  fontSize: "0.72rem",
  color: "rgba(226, 232, 240, 0.8)",
});

export const gridSentinel = style({
  width: "100%",
  height: "1px",
});

globalStyle(`.${gridCard}[data-rarity="common"]`, {
  background: "linear-gradient(180deg, rgba(143, 160, 183, 0.12) 0%, rgba(7, 14, 26, 0.1) 100%)",
});

globalStyle(`.${gridCard}[data-rarity="uncommon"]`, {
  background: "linear-gradient(180deg, rgba(85, 208, 145, 0.14) 0%, rgba(7, 14, 26, 0.1) 100%)",
});

globalStyle(`.${gridCard}[data-rarity="rare"]`, {
  background: "linear-gradient(180deg, rgba(93, 168, 255, 0.14) 0%, rgba(7, 14, 26, 0.1) 100%)",
});

globalStyle(`.${gridCard}[data-rarity="epic"]`, {
  background: "linear-gradient(180deg, rgba(199, 137, 255, 0.14) 0%, rgba(7, 14, 26, 0.1) 100%)",
});

globalStyle(`.${gridCard}[data-rarity="legendary"]`, {
  background: "linear-gradient(180deg, rgba(246, 197, 111, 0.15) 0%, rgba(7, 14, 26, 0.1) 100%)",
});

globalStyle(`.${targetSlot}[data-rarity="uncommon"]`, {
  background: "linear-gradient(180deg, rgba(85, 208, 145, 0.14) 0%, rgba(8, 14, 24, 0.82) 100%)",
});

globalStyle(`.${targetSlot}[data-rarity="rare"]`, {
  background: "linear-gradient(180deg, rgba(93, 168, 255, 0.16) 0%, rgba(8, 14, 24, 0.82) 100%)",
});

globalStyle(`.${targetSlot}[data-rarity="epic"]`, {
  background: "linear-gradient(180deg, rgba(199, 137, 255, 0.16) 0%, rgba(8, 14, 24, 0.82) 100%)",
});

globalStyle(`.${targetSlot}[data-rarity="legendary"]`, {
  background: "linear-gradient(180deg, rgba(246, 197, 111, 0.18) 0%, rgba(8, 14, 24, 0.82) 100%)",
});

globalStyle(`.${page} select option:disabled`, {
  color: "#7c8a9c",
});
