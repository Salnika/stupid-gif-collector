import { globalStyle, keyframes, style } from "@vanilla-extract/css";
import brushedMetal from "../../../assets/svg/brushed-metal.svg";
import holoNoise from "../../../assets/svg/holo-noise.svg";
import paperStrongCommon from "../../../assets/svg/paper-strong-c.svg";
import paperStrongUncommon from "../../../assets/svg/paper-strong-uc.svg";
import { vars } from "../../../shared/styles/theme.css";

const dialogPackAspectRatio = "11 / 23";
const dialogRewardAspectRatio = "5 / 7";
const dialogCardRadius = "1.18rem";
const dialogPackCapClipPath =
  "polygon(0 0, 100% 0, 100% 19.2%, 90% 17.9%, 82% 19.7%, 74% 18.1%, 66% 19.9%, 58% 18.2%, 50% 19.5%, 42% 18.1%, 34% 19.8%, 26% 18.2%, 18% 19.6%, 10% 17.8%, 0 19.2%)";
const dialogPackBodyClipPath =
  "polygon(0 19.2%, 10% 17.8%, 18% 19.6%, 26% 18.2%, 34% 19.8%, 42% 18.1%, 50% 19.5%, 58% 18.2%, 66% 19.9%, 74% 18.1%, 82% 19.7%, 90% 17.9%, 100% 19.2%, 100% 100%, 0 100%)";

const portalPulse = keyframes({
  "0%, 100%": {
    transform: "scale(0.98)",
    opacity: 0.88,
  },
  "50%": {
    transform: "scale(1.06)",
    opacity: 1,
  },
});

const portalSpritesheet = keyframes({
  "0%": { backgroundPosition: "0 0" },
  "6.25%": { backgroundPosition: "calc(var(--loader-size) * -1) 0" },
  "12.5%": { backgroundPosition: "calc(var(--loader-size) * -2) 0" },
  "18.75%": { backgroundPosition: "calc(var(--loader-size) * -3) 0" },
  "25%": { backgroundPosition: "0 calc(var(--loader-size) * -1)" },
  "31.25%": { backgroundPosition: "calc(var(--loader-size) * -1) calc(var(--loader-size) * -1)" },
  "37.5%": { backgroundPosition: "calc(var(--loader-size) * -2) calc(var(--loader-size) * -1)" },
  "43.75%": { backgroundPosition: "calc(var(--loader-size) * -3) calc(var(--loader-size) * -1)" },
  "50%": { backgroundPosition: "0 calc(var(--loader-size) * -2)" },
  "56.25%": { backgroundPosition: "calc(var(--loader-size) * -1) calc(var(--loader-size) * -2)" },
  "62.5%": { backgroundPosition: "calc(var(--loader-size) * -2) calc(var(--loader-size) * -2)" },
  "68.75%": { backgroundPosition: "calc(var(--loader-size) * -3) calc(var(--loader-size) * -2)" },
  "75%": { backgroundPosition: "0 calc(var(--loader-size) * -3)" },
  "81.25%": { backgroundPosition: "calc(var(--loader-size) * -1) calc(var(--loader-size) * -3)" },
  "87.5%": { backgroundPosition: "calc(var(--loader-size) * -2) calc(var(--loader-size) * -3)" },
  "93.75%, 100%": {
    backgroundPosition: "calc(var(--loader-size) * -3) calc(var(--loader-size) * -3)",
  },
});

const flashPulse = keyframes({
  "0%": {
    opacity: 0,
    transform: "translate(-50%, -50%) scale(0.2)",
  },
  "18%": {
    opacity: 0.95,
    transform: "translate(-50%, -50%) scale(1.08)",
  },
  "65%": {
    opacity: 0.5,
    transform: "translate(-50%, -50%) scale(1.55)",
  },
  "100%": {
    opacity: 0,
    transform: "translate(-50%, -50%) scale(1.9)",
  },
});

const packTopRip = keyframes({
  "0%, 24%": {
    transform: "translate3d(0, 0, 0) rotateZ(0deg) scale(1)",
    opacity: 1,
  },
  "46%": {
    transform: "translate3d(-4px, -16px, 0) rotateZ(-3deg) scale(1.02)",
    opacity: 1,
  },
  "76%": {
    transform: "translate3d(-32px, -132px, 0) rotateZ(-14deg) scale(0.98)",
    opacity: 0.98,
  },
  "100%": {
    transform: "translate3d(-58px, -212px, 0) rotateZ(-22deg) scale(0.9)",
    opacity: 0,
  },
});

const packBodyRelease = keyframes({
  "0%, 24%": {
    transform: "translate3d(0, 0, 0) scale(1)",
    opacity: 1,
  },
  "42%": {
    transform: "translate3d(0, 10px, 0) scale(1.01)",
    opacity: 1,
  },
  "78%": {
    transform: "translate3d(0, 72px, 0) scale(0.98)",
    opacity: 1,
  },
  "100%": {
    transform: "translate3d(0, 224px, 0) scale(0.88)",
    opacity: 0,
  },
});

const packMouthGlow = keyframes({
  "0%, 26%": {
    opacity: 0,
    transform: "translateX(-50%) scaleX(0.84) scaleY(0.5)",
  },
  "44%": {
    opacity: 0.9,
    transform: "translateX(-50%) scaleX(1) scaleY(1)",
  },
  "100%": {
    opacity: 0,
    transform: "translateX(-50%) scaleX(1.08) scaleY(1.4)",
  },
});

const cutSweep = keyframes({
  "0%": {
    left: "16%",
    opacity: 0,
    transform: "translateY(-50%) skewX(-18deg) scaleX(0.5)",
  },
  "18%": {
    opacity: 1,
  },
  "100%": {
    left: "84%",
    opacity: 0,
    transform: "translateY(-50%) skewX(-18deg) scaleX(1.08)",
  },
});

const cardSpread = keyframes({
  "0%": {
    transform: "translate(-50%, -50%) scale(0.72) rotateZ(0deg)",
    opacity: 0,
  },
  "18%": {
    opacity: 1,
  },
  "30%": {
    transform: "translate(calc(-50% - 18px), calc(-50% + 28px)) scale(0.76) rotateZ(0deg)",
    opacity: 1,
  },
  "100%": {
    transform:
      "translate(calc(-50% + var(--spread-x)), calc(-50% + var(--spread-y))) scale(1) rotateZ(var(--spread-rotate))",
    opacity: 1,
  },
});

const cardFlip = keyframes({
  "0%": {
    transform: "rotateY(0deg)",
  },
  "100%": {
    transform: "rotateY(180deg)",
  },
});

const revealFade = keyframes({
  "0%": {
    opacity: 0,
    transform: "translateY(18px)",
  },
  "100%": {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const page = style({
  width: "100%",
  minHeight: "100%",
  backgroundImage:
    "linear-gradient(180deg, rgba(2, 6, 23, 0.18) 0%, rgba(2, 6, 23, 0.42) 100%), url('/background.jpg')",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundColor: "#020617",
});

export const scrollStage = style({
  position: "fixed",
  inset: 0,
  overflow: "auto",
  overscrollBehavior: "none",
  touchAction: "none",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
});

globalStyle(`${scrollStage}::-webkit-scrollbar`, {
  width: 0,
  height: 0,
  display: "none",
});

export const content = style({
  width: "100%",
  minHeight: "540vh",
  visibility: "hidden",
  pointerEvents: "none",
});

export const spacer = style({
  height: "540vh",
});

export const overlay = style({
  vars: {
    "--glyph-visibility": "0",
    "--glyph-shift": "0",
  },
  position: "fixed",
  inset: 0,
  zIndex: 35,
  overflow: "hidden",
  pointerEvents: "none",
});

export const stageGlow = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "min(110vw, 1120px)",
  height: "min(80vw, 780px)",
  transform: "translate(-50%, -50%)",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(141, 255, 148, 0.08) 0%, rgba(190, 126, 255, 0.12) 34%, rgba(19, 24, 48, 0.03) 64%, transparent 78%)",
  filter: "blur(16px)",
});

export const loaderAnchor = style({
  position: "absolute",
  transform: "translate(-50%, -50%)",
  zIndex: 36,
});

export const topBar = style({
  position: "absolute",
  top: "clamp(0.95rem, 2vw, 1.2rem)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 48,
  display: "grid",
  justifyItems: "center",
  gap: "0.24rem",
  textAlign: "center",
});

export const eyebrow = style({
  margin: 0,
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "rgba(226, 232, 240, 0.82)",
});

export const title = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: "clamp(1.2rem, 2vw, 1.7rem)",
  letterSpacing: "0.05em",
  color: "rgba(241, 245, 249, 0.96)",
  textShadow: "0 0 24px rgba(159, 254, 167, 0.18), 0 0 40px rgba(190, 126, 255, 0.18)",
});

export const subtitle = style({
  margin: 0,
  maxWidth: "min(88vw, 520px)",
  fontSize: "0.78rem",
  lineHeight: 1.45,
  color: "rgba(226, 232, 240, 0.72)",
});

export const remainingPill = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "1.9rem",
  padding: "0 0.75rem",
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  background: "rgba(8, 14, 24, 0.6)",
  color: "rgba(226, 232, 240, 0.92)",
  fontSize: "0.72rem",
  letterSpacing: "0.11em",
  textTransform: "uppercase",
  backdropFilter: "blur(12px)",
});

export const countdownPill = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "1.9rem",
  padding: "0 0.8rem",
  borderRadius: vars.radius.pill,
  border: "1px solid rgba(154, 230, 180, 0.26)",
  background: "rgba(11, 32, 20, 0.56)",
  color: "rgba(220, 252, 231, 0.94)",
  fontSize: "0.72rem",
  letterSpacing: "0.11em",
  textTransform: "uppercase",
  backdropFilter: "blur(12px)",
  boxShadow: "0 0 24px rgba(74, 222, 128, 0.12)",
});

export const carousel = style({
  position: "absolute",
  left: "50%",
  top: "46%",
  width: "min(92vw, 540px)",
  height: "min(80vh, 740px)",
  transform: "translate(-50%, -50%)",
  zIndex: 44,
});

export const packButton = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "min(68vw, 324px)",
  aspectRatio: "0.74",
  transformOrigin: "center center",
  border: 0,
  padding: 0,
  background: "transparent",
  cursor: "pointer",
  pointerEvents: "auto",
  transition: "transform 180ms linear, opacity 180ms linear, filter 180ms linear",
});

export const packFrame = style({
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "visible",
  isolation: "isolate",
});

export const packVisual = style({
  position: "relative",
  width: "100%",
  height: "100%",
  isolation: "isolate",
});

export const packArt = style({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  filter: "drop-shadow(0 12px 20px rgba(0, 0, 0, 0.3))",
});

export const packTextureMetal = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: `url("${brushedMetal}")`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  opacity: 0.68,
  mixBlendMode: "screen",
  WebkitMaskImage: "var(--pack-mask)",
  maskImage: "var(--pack-mask)",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

export const packTextureHolo = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: `url("${holoNoise}")`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  opacity: 0.64,
  mixBlendMode: "screen",
  WebkitMaskImage: "var(--pack-mask)",
  maskImage: "var(--pack-mask)",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

export const packTextureGloss = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  WebkitMaskImage: "var(--pack-mask)",
  maskImage: "var(--pack-mask)",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

globalStyle(`${packTextureGloss}::before`, {
  content: "",
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 34%), linear-gradient(105deg, transparent 22%, rgba(255, 255, 255, 0.22) 43%, rgba(255, 255, 255, 0.04) 58%, transparent 70%)",
  opacity: 0.52,
  pointerEvents: "none",
});

export const packBadge = style({
  position: "relative",
  zIndex: 2,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  minHeight: "1.9rem",
  padding: "0 0.72rem",
  borderRadius: vars.radius.pill,
  background: "rgba(24, 10, 26, 0.54)",
  border: "1px solid rgba(255, 220, 236, 0.16)",
  color: "rgba(255, 240, 247, 0.96)",
  fontSize: "0.72rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  boxShadow: "0 8px 18px rgba(6, 8, 17, 0.2)",
  backdropFilter: "blur(8px)",
});

export const packFooter = style({
  position: "absolute",
  left: "50%",
  right: "auto",
  bottom: "1rem",
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space.sm,
  zIndex: 1,
  width: "calc(100% - 2rem)",
  flexWrap: "wrap",
});

export const packStatus = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "1.9rem",
  padding: "0 0.7rem",
  borderRadius: vars.radius.pill,
  background: "rgba(255, 221, 237, 0.18)",
  color: "#fff2f8",
  fontSize: "0.76rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
});

export const packFooterText = style({
  margin: 0,
  fontSize: "0.8rem",
  lineHeight: 1.5,
  color: "rgba(255, 228, 241, 0.72)",
  textAlign: "right",
});

globalStyle(`${packButton}:focus-visible ${packFrame}`, {
  outline: "2px solid rgba(255, 232, 170, 0.84)",
  outlineOffset: "4px",
});

globalStyle(`${packButton}[data-status="opened"] ${packArt}`, {
  filter: "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.32)) brightness(1.04)",
});

globalStyle(`${packButton}[data-status="opened"] ${packTextureHolo}`, {
  opacity: 0.78,
});

globalStyle(`${packButton}[data-status="opened"] ${packStatus}`, {
  background: "rgba(125, 211, 252, 0.18)",
  color: "#d8f0ff",
});

export const currentPackPanel = style({
  position: "absolute",
  left: "50%",
  bottom: "clamp(0.85rem, 3vw, 1.45rem)",
  transform: "translateX(-50%)",
  width: "min(94vw, 560px)",
  zIndex: 49,
  pointerEvents: "auto",
  display: "grid",
  gap: vars.space.xs,
  justifyItems: "center",
  textAlign: "center",
  padding: "0.75rem 0.9rem 0.82rem",
  borderRadius: "1rem",
  background: "rgba(8, 14, 24, 0.48)",
  border: `1px solid ${vars.color.border}`,
  backdropFilter: "blur(12px)",
});

export const currentPackSummary = style({
  margin: 0,
  fontSize: "0.95rem",
  lineHeight: 1.5,
  color: "rgba(244, 247, 255, 0.86)",
});

export const currentPackHint = style({
  margin: 0,
  fontSize: "0.76rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(226, 232, 240, 0.72)",
});

export const currentPackActions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.xs,
  justifyContent: "center",
});

export const stateCard = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 52,
  pointerEvents: "auto",
  display: "grid",
  gap: vars.space.sm,
  justifyItems: "center",
  textAlign: "center",
  width: "min(92vw, 440px)",
  padding: "1.5rem",
  borderRadius: "1.4rem",
  background: "rgba(7, 10, 20, 0.72)",
  border: "1px solid rgba(255, 244, 215, 0.12)",
  backdropFilter: "blur(18px)",
});

export const stateTitle = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: "1.6rem",
  color: "#fff6dc",
});

export const stateText = style({
  margin: 0,
  lineHeight: 1.6,
  color: "rgba(235, 241, 255, 0.76)",
});

export const emptyCountdown = style({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 52,
  display: "grid",
  justifyItems: "center",
  gap: vars.space.sm,
  textAlign: "center",
  pointerEvents: "none",
});

export const emptyCountdownLabel = style({
  margin: 0,
  fontSize: "0.82rem",
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "rgba(226, 232, 240, 0.72)",
});

export const emptyCountdownValue = style({
  margin: 0,
  fontFamily: vars.font.display,
  fontSize: "clamp(4.8rem, 15vw, 9.5rem)",
  lineHeight: 0.92,
  letterSpacing: "-0.04em",
  color: "rgba(245, 251, 255, 0.98)",
  textShadow: "0 0 24px rgba(186, 250, 195, 0.2), 0 0 56px rgba(190, 126, 255, 0.18)",
});

export const dialogBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 120,
  display: "grid",
  alignItems: "center",
  justifyItems: "center",
  padding: "max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom))",
  background: "rgba(2, 3, 9, 0.72)",
  backdropFilter: "blur(20px)",
  pointerEvents: "auto",
});

export const dialogPanel = style({
  position: "relative",
  width: "min(96vw, 1120px)",
  maxHeight: "92vh",
  padding: "1.1rem 1.1rem 1.3rem",
  overflow: "auto",
  borderRadius: "1.8rem",
  border: "1px solid rgba(255, 244, 215, 0.12)",
  background: "linear-gradient(180deg, rgba(14, 17, 30, 0.96) 0%, rgba(8, 10, 19, 0.98) 100%)",
  boxShadow: "0 34px 70px rgba(0, 0, 0, 0.44)",
});

export const dialogHeader = style({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: vars.space.md,
  alignItems: "start",
});

export const dialogEyebrow = style({
  margin: 0,
  fontSize: "0.72rem",
  letterSpacing: "0.24em",
  textTransform: "uppercase",
  color: "rgba(255, 239, 209, 0.64)",
});

export const dialogTitle = style({
  margin: "0.35rem 0 0",
  fontFamily: vars.font.display,
  fontSize: "clamp(1.7rem, 3vw, 2.45rem)",
  color: "#fff8e3",
});

export const dialogMeta = style({
  margin: "0.45rem 0 0",
  fontSize: "0.96rem",
  lineHeight: 1.65,
  color: "rgba(232, 238, 255, 0.74)",
});

export const closeButton = style({
  minWidth: "2.5rem",
  minHeight: "2.5rem",
  borderRadius: vars.radius.pill,
  border: "1px solid rgba(255, 243, 214, 0.16)",
  background: "rgba(255, 255, 255, 0.05)",
  color: "#fff8e3",
  fontSize: "0.82rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      borderColor: "rgba(255, 239, 193, 0.36)",
    },
  },
});

export const dialogArena = style({
  position: "relative",
  minHeight: "clamp(420px, 62vh, 640px)",
  marginTop: "1rem",
  overflow: "hidden",
  borderRadius: "1.45rem",
  background:
    "radial-gradient(circle at top, rgba(250, 204, 21, 0.1) 0%, transparent 28%), radial-gradient(circle at center, rgba(99, 102, 241, 0.14) 0%, rgba(7, 10, 20, 0) 55%), linear-gradient(180deg, rgba(6, 8, 17, 0.86) 0%, rgba(4, 5, 11, 0.98) 100%)",
});

export const dialogFlash = style({
  position: "absolute",
  left: "50%",
  top: "39%",
  width: "clamp(140px, 20vw, 260px)",
  height: "clamp(140px, 20vw, 260px)",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(255, 248, 226, 0.98) 0%, rgba(255, 222, 130, 0.86) 22%, rgba(255, 105, 180, 0.2) 48%, transparent 72%)",
  opacity: 0,
  pointerEvents: "none",
});

export const dialogPackStage = style({
  position: "absolute",
  left: "50%",
  top: "48%",
  width: "clamp(168px, 24vw, 238px)",
  aspectRatio: dialogPackAspectRatio,
  transform: "translate(-50%, -50%)",
});

export const dialogPackTrigger = style({
  position: "relative",
  display: "block",
  width: "100%",
  minHeight: "inherit",
  border: 0,
  padding: 0,
  background: "transparent",
  cursor: "pointer",
  selectors: {
    "&:focus-visible": {
      outline: "2px solid rgba(255, 232, 170, 0.84)",
      outlineOffset: "4px",
    },
  },
});

export const dialogPackPrompt = style({
  position: "absolute",
  left: "50%",
  bottom: "clamp(1.2rem, 3vw, 2rem)",
  transform: "translateX(-50%)",
  display: "grid",
  justifyItems: "center",
  gap: "0.45rem",
  width: "min(90vw, 340px)",
  pointerEvents: "none",
});

export const dialogPackPromptBadge = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "2rem",
  padding: "0 0.9rem",
  borderRadius: vars.radius.pill,
  background: "rgba(255, 244, 215, 0.12)",
  border: "1px solid rgba(255, 244, 215, 0.22)",
  color: "#fff7dc",
  fontSize: "0.76rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  backdropFilter: "blur(8px)",
});

export const dialogPackPromptText = style({
  margin: 0,
  maxWidth: "28rem",
  textAlign: "center",
  fontSize: "0.92rem",
  lineHeight: 1.6,
  color: "rgba(232, 238, 255, 0.76)",
});

export const dialogPackShell = style({
  position: "absolute",
  inset: 0,
  isolation: "isolate",
});

export const dialogPackTopPiece = style({
  position: "absolute",
  inset: 0,
  clipPath: dialogPackCapClipPath,
  transformOrigin: "50% 84%",
  willChange: "transform, opacity",
});

export const dialogPackBodyPiece = style({
  position: "absolute",
  inset: 0,
  clipPath: dialogPackBodyClipPath,
  transformOrigin: "50% 18%",
  willChange: "transform, opacity",
});

export const dialogPackMouth = style({
  position: "absolute",
  left: "50%",
  top: "19.1%",
  width: "78%",
  height: "1.1rem",
  transform: "translateX(-50%) scaleX(0.84) scaleY(0.5)",
  borderRadius: vars.radius.pill,
  background:
    "radial-gradient(circle at center, rgba(248, 250, 252, 0.82) 0%, rgba(255, 214, 102, 0.48) 24%, rgba(18, 18, 31, 0.82) 58%, rgba(2, 6, 23, 0.96) 100%)",
  filter: "blur(5px)",
  opacity: 0,
  pointerEvents: "none",
});

export const dialogPackArt = style({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  filter: "drop-shadow(0 18px 32px rgba(0, 0, 0, 0.36))",
});

export const dialogPackTextureMetal = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: `url("${brushedMetal}")`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  opacity: 0.72,
  mixBlendMode: "screen",
  WebkitMaskImage: "var(--pack-mask)",
  maskImage: "var(--pack-mask)",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

export const dialogPackTextureHolo = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: `url("${holoNoise}")`,
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  opacity: 0.68,
  mixBlendMode: "screen",
  WebkitMaskImage: "var(--pack-mask)",
  maskImage: "var(--pack-mask)",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

export const dialogPackTextureGloss = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  WebkitMaskImage: "var(--pack-mask)",
  maskImage: "var(--pack-mask)",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

globalStyle(`${dialogPackTextureGloss}::before`, {
  content: "",
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 18%, transparent 34%), linear-gradient(105deg, transparent 22%, rgba(255, 255, 255, 0.22) 43%, rgba(255, 255, 255, 0.04) 58%, transparent 70%)",
  opacity: 0.58,
});

export const dialogCut = style({
  position: "absolute",
  top: "19.2%",
  left: "16%",
  width: "40%",
  height: "0.95rem",
  transform: "translateY(-50%) skewX(-18deg)",
  borderRadius: vars.radius.pill,
  background:
    "linear-gradient(90deg, transparent 0%, rgba(255, 250, 235, 0.08) 16%, rgba(255, 249, 235, 0.92) 50%, rgba(255, 213, 94, 0.68) 72%, transparent 100%)",
  opacity: 0,
  mixBlendMode: "screen",
  filter: "blur(1.4px)",
  pointerEvents: "none",
});

export const dialogCardsFan = style({
  position: "absolute",
  inset: 0,
  listStyle: "none",
  margin: 0,
  padding: 0,
});

export const dialogCardSlot = style({
  position: "absolute",
  left: "50%",
  top: "57%",
  width: "clamp(116px, 15vw, 170px)",
  aspectRatio: dialogRewardAspectRatio,
  transform: "translate(-50%, -50%)",
  opacity: 0,
  perspective: "1600px",
  filter: "drop-shadow(0 18px 24px rgba(0, 0, 0, 0.34))",
});

export const dialogCardButton = style({
  display: "block",
  width: "100%",
  height: "100%",
  padding: 0,
  border: 0,
  background: "transparent",
  cursor: "zoom-in",
  transition: "transform 180ms ease, filter 180ms ease",
  selectors: {
    '&[data-disabled="true"]': {
      cursor: "default",
    },
    "&:focus-visible": {
      outline: "2px solid rgba(255, 232, 170, 0.84)",
      outlineOffset: "4px",
    },
  },
});

export const dialogCardInner = style({
  position: "relative",
  width: "100%",
  height: "100%",
  transformStyle: "preserve-3d",
});

export const dialogCardBack = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  borderRadius: dialogCardRadius,
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backfaceVisibility: "hidden",
  background:
    "linear-gradient(160deg, rgba(17, 24, 39, 0.94) 0%, rgba(28, 31, 54, 0.98) 46%, rgba(9, 10, 19, 0.98) 100%)",
  boxShadow: "0 16px 26px rgba(0, 0, 0, 0.34)",
  isolation: "isolate",
});

globalStyle(`${dialogCardBack}::before`, {
  content: "",
  position: "absolute",
  inset: "0.8rem",
  borderRadius: "0.92rem",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  backgroundPosition: "center",
  backgroundRepeat: "repeat",
  backgroundSize: "256px 256px",
  opacity: 0.6,
});

globalStyle(`${dialogCardBack}::after`, {
  content: "",
  position: "absolute",
  inset: 0,
  borderRadius: dialogCardRadius,
  backgroundImage: `url("${holoNoise}")`,
  backgroundPosition: "center",
  backgroundRepeat: "repeat",
  backgroundSize: "256px 256px",
  mixBlendMode: "screen",
  opacity: 0.12,
  pointerEvents: "none",
});

globalStyle(`${dialogCardBack}[data-rarity="common"]`, {
  background:
    "linear-gradient(160deg, rgba(79, 45, 23, 0.98) 0%, rgba(122, 66, 29, 0.96) 46%, rgba(48, 27, 14, 0.98) 100%)",
  boxShadow: `0 16px 26px rgba(0, 0, 0, 0.34), 0 0 0 2px ${vars.color.rarityCommon}`,
});

globalStyle(`${dialogCardBack}[data-rarity="common"]::before`, {
  backgroundImage: `url("${paperStrongCommon}")`,
});

globalStyle(`${dialogCardBack}[data-rarity="common"]::after`, {
  opacity: 0.1,
});

globalStyle(`${dialogCardBack}[data-rarity="uncommon"]`, {
  background:
    "linear-gradient(160deg, rgba(34, 56, 54, 0.98) 0%, rgba(55, 125, 116, 0.96) 46%, rgba(18, 32, 30, 0.98) 100%)",
  boxShadow: `0 16px 26px rgba(0, 0, 0, 0.34), 0 0 0 2px ${vars.color.rarityUncommon}`,
});

globalStyle(`${dialogCardBack}[data-rarity="uncommon"]::before`, {
  backgroundImage: `url("${paperStrongUncommon}")`,
});

globalStyle(`${dialogCardBack}[data-rarity="uncommon"]::after`, {
  opacity: 0.14,
});

globalStyle(`${dialogCardBack}[data-rarity="rare"]`, {
  background:
    "linear-gradient(160deg, rgba(82, 60, 15, 0.98) 0%, rgba(196, 138, 28, 0.96) 46%, rgba(57, 41, 9, 0.98) 100%)",
  boxShadow: `0 16px 26px rgba(0, 0, 0, 0.34), 0 0 0 2px ${vars.color.rarityRare}`,
});

globalStyle(`${dialogCardBack}[data-rarity="rare"]::before`, {
  backgroundImage: `url("${brushedMetal}")`,
});

globalStyle(`${dialogCardBack}[data-rarity="rare"]::after`, {
  opacity: 0.18,
});

globalStyle(`${dialogCardBack}[data-rarity="epic"]`, {
  background:
    "linear-gradient(160deg, rgba(61, 28, 92, 0.98) 0%, rgba(144, 74, 216, 0.96) 46%, rgba(37, 18, 56, 0.98) 100%)",
  boxShadow: `0 16px 26px rgba(0, 0, 0, 0.34), 0 0 0 2px ${vars.color.rarityEpic}`,
});

globalStyle(`${dialogCardBack}[data-rarity="epic"]::before`, {
  backgroundImage: `url("${brushedMetal}")`,
});

globalStyle(`${dialogCardBack}[data-rarity="epic"]::after`, {
  opacity: 0.24,
});

globalStyle(`${dialogCardBack}[data-rarity="legendary"]`, {
  background:
    "linear-gradient(160deg, rgba(120, 61, 15, 0.98) 0%, rgba(255, 210, 72, 0.96) 42%, rgba(122, 70, 12, 0.98) 100%)",
  boxShadow: `0 16px 26px rgba(0, 0, 0, 0.34), 0 0 0 2px ${vars.color.rarityLegendary}`,
});

globalStyle(`${dialogCardBack}[data-rarity="legendary"]::before`, {
  backgroundImage: `url("${brushedMetal}")`,
});

globalStyle(`${dialogCardBack}[data-rarity="legendary"]::after`, {
  opacity: 0.3,
});

export const dialogCardBackLabel = style({
  position: "relative",
  zIndex: 2,
  fontFamily: vars.font.display,
  fontSize: "1.1rem",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#fff8e3",
});

export const dialogCardFront = style({
  position: "absolute",
  inset: 0,
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto",
  overflow: "hidden",
  borderRadius: dialogCardRadius,
  background: "rgba(7, 10, 20, 0.96)",
  backfaceVisibility: "hidden",
  transform: "rotateY(180deg)",
  isolation: "isolate",
});

export const dialogStaticCard = style({
  position: "relative",
  inset: "auto",
  width: "100%",
  height: "100%",
  transform: "none",
  backfaceVisibility: "visible",
  boxShadow: "0 18px 26px rgba(0, 0, 0, 0.36)",
  transition: "transform 180ms ease, box-shadow 180ms ease",
});

export const dialogStaticCardButton = style([
  dialogCardButton,
  {
    width: "min(100%, 196px)",
    aspectRatio: dialogRewardAspectRatio,
    justifySelf: "center",
  },
]);

export const dialogPreviewBackdrop = style({
  position: "fixed",
  inset: 0,
  zIndex: 140,
  display: "grid",
  placeItems: "center",
  padding: "1.2rem",
  background: "rgba(2, 6, 23, 0.58)",
  backdropFilter: "blur(4px)",
});

export const dialogPreviewPanel = style({
  display: "grid",
  justifyItems: "center",
  gap: vars.space.sm,
});

export const dialogPreviewCard = style({
  position: "relative",
  inset: "auto",
  width: "min(88vw, 340px)",
  aspectRatio: dialogRewardAspectRatio,
  transform: "none",
  backfaceVisibility: "visible",
  boxShadow: "0 28px 40px rgba(0, 0, 0, 0.42)",
});

globalStyle(`${dialogCardFront}::before`, {
  content: "",
  position: "absolute",
  inset: 0,
  backgroundPosition: "center",
  backgroundRepeat: "repeat",
  backgroundSize: "256px 256px",
  opacity: 0.22,
  pointerEvents: "none",
  zIndex: 1,
});

globalStyle(`${dialogCardFront}::after`, {
  content: "",
  position: "absolute",
  inset: 0,
  backgroundImage: `url("${holoNoise}")`,
  backgroundPosition: "center",
  backgroundRepeat: "repeat",
  backgroundSize: "256px 256px",
  opacity: 0.1,
  mixBlendMode: "screen",
  pointerEvents: "none",
  zIndex: 1,
});

globalStyle(`${dialogCardFront}[data-rarity="common"]::before`, {
  backgroundImage: `url("${paperStrongCommon}")`,
  opacity: 0.22,
});

globalStyle(`${dialogCardFront}[data-rarity="common"]::after`, {
  opacity: 0.08,
});

globalStyle(`${dialogCardFront}[data-rarity="uncommon"]::before`, {
  backgroundImage: `url("${paperStrongUncommon}")`,
  opacity: 0.24,
});

globalStyle(`${dialogCardFront}[data-rarity="uncommon"]::after`, {
  opacity: 0.1,
});

globalStyle(`${dialogCardFront}[data-rarity="rare"]::before`, {
  backgroundImage: `url("${brushedMetal}")`,
  opacity: 0.18,
});

globalStyle(`${dialogCardFront}[data-rarity="rare"]::after`, {
  opacity: 0.14,
});

globalStyle(`${dialogCardFront}[data-rarity="epic"]::before`, {
  backgroundImage: `url("${brushedMetal}")`,
  opacity: 0.2,
});

globalStyle(`${dialogCardFront}[data-rarity="epic"]::after`, {
  opacity: 0.18,
});

globalStyle(`${dialogCardFront}[data-rarity="legendary"]::before`, {
  backgroundImage: `url("${brushedMetal}")`,
  opacity: 0.24,
});

globalStyle(`${dialogCardFront}[data-rarity="legendary"]::after`, {
  opacity: 0.22,
});

export const dialogCardImage = style({
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  padding: "0.95rem 0.95rem 0 0.95rem",
  objectFit: "contain",
  background:
    "radial-gradient(circle at top, rgba(125, 211, 252, 0.12) 0%, rgba(2, 6, 23, 0) 48%), #020617",
});

export const dialogCardBody = style({
  position: "relative",
  zIndex: 2,
  display: "grid",
  gap: "0.22rem",
  padding: "0.72rem 0.8rem 0.85rem",
  background: "linear-gradient(180deg, rgba(15, 18, 31, 0.92) 0%, rgba(7, 10, 20, 0.98) 100%)",
});

export const dialogCardTopRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.xs,
});

export const dialogCardNumber = style({
  margin: 0,
  fontSize: "0.74rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "rgba(255, 240, 214, 0.64)",
});

export const dialogCardCount = style({
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

export const dialogCardName = style({
  margin: 0,
  fontSize: "0.92rem",
  lineHeight: 1.4,
  color: vars.color.text,
});

export const dialogCardCollection = style({
  margin: 0,
  fontSize: "0.78rem",
  lineHeight: 1.45,
  color: "rgba(214, 223, 239, 0.7)",
});

export const dialogCardFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.xs,
});

export const dialogNewBadge = style({
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

export const dialogStaticGrid = style({
  marginTop: "1rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 164px), 1fr))",
  gap: vars.space.md,
  justifyItems: "center",
});

export const dialogActions = style({
  marginTop: "1.2rem",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: vars.space.sm,
  alignItems: "center",
});

export const dialogHint = style({
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "rgba(225, 232, 245, 0.72)",
});

export const dialogActionGroup = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.xs,
});

globalStyle(`.portal-glyphs`, {
  position: "fixed",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
  opacity: "var(--glyph-visibility)",
  zIndex: 38,
});

globalStyle(`.portal-glyphs::before`, {
  content: "",
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(circle at 58% 34%, rgba(167, 139, 250, calc(var(--glyph-visibility) * 0.14)) 0%, rgba(139, 92, 246, calc(var(--glyph-visibility) * 0.08)) 34%, transparent 68%)",
});

globalStyle(`.portal-glyphs__column`, {
  position: "absolute",
  top: 0,
  height: "100%",
  width: "clamp(2rem, 3.8vw, 3.7rem)",
  color: "rgba(195, 149, 255, 0.72)",
  textShadow: "0 0 5px rgba(167, 139, 250, 0.4), 0 0 11px rgba(139, 92, 246, 0.22)",
  opacity: "calc(0.06 + var(--glyph-visibility) * 0.22)",
  overflow: "hidden",
});

globalStyle(`.portal-glyphs__track`, {
  display: "flex",
  flexDirection: "column",
  minHeight: "220%",
  gap: "0.7rem",
  transform:
    "translate3d(0, calc(((var(--glyph-shift) * var(--glyph-rate) + var(--glyph-phase)) * var(--glyph-direction) * 1%)), 0)",
  willChange: "transform",
});

globalStyle(`.portal-glyphs__line`, {
  fontSize: "clamp(4.2rem, 7.6vw, 6.6rem)",
  fontWeight: 700,
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
  textAlign: "center",
  fontFamily:
    "'Noto Sans Runic', 'Metamorphous', 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Apple Symbols', serif",
});

globalStyle(`.portal-loader`, {
  vars: {
    "--loader-size": "min(34vw, 17rem)",
    "--portal-speed-glow": "0",
  },
  position: "relative",
  width: "var(--loader-size)",
  aspectRatio: "1 / 1",
  borderRadius: "50%",
  willChange: "transform",
});

globalStyle(`.portal-loader__aura`, {
  position: "absolute",
  inset: "-6%",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(183, 87, 255, 0.18) 0%, rgba(183, 87, 255, 0.04) 58%, transparent 72%), radial-gradient(circle, rgba(141, 255, 148, 0.33) 35%, rgba(141, 255, 148, 0.06) 70%, transparent 90%)",
  opacity: "calc(0.75 + var(--portal-speed-glow) * 0.25)",
  filter: "blur(calc(8px + var(--portal-speed-glow) * 7px))",
  animation: `${portalPulse} 2.4s ease-in-out infinite`,
});

globalStyle(`.portal-loader__speed-glow`, {
  position: "absolute",
  inset: "-14%",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(170, 86, 255, 0.7) 0%, rgba(170, 86, 255, 0.18) 42%, transparent 70%), radial-gradient(circle, rgba(148, 255, 177, 0.8) 22%, rgba(148, 255, 177, 0.12) 58%, transparent 84%)",
  opacity: "calc(0.12 + var(--portal-speed-glow) * 0.88)",
  transform: "scale(calc(0.9 + var(--portal-speed-glow) * 0.22))",
  filter: "blur(calc(6px + var(--portal-speed-glow) * 12px))",
});

globalStyle(`.portal-loader__sprite`, {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  backgroundImage: "url('/assets/portal/teleport-circle-spritesheet.png')",
  backgroundRepeat: "no-repeat",
  backgroundSize: "calc(var(--loader-size) * 4) calc(var(--loader-size) * 4)",
  mixBlendMode: "screen",
});

globalStyle(`.portal-loader__sprite--back`, {
  opacity: "calc(0.74 + var(--portal-speed-glow) * 0.26)",
  filter: "hue-rotate(118deg) saturate(1.8) brightness(1.06) blur(2px)",
  animation: `${portalSpritesheet} 5600ms steps(1, end) infinite`,
});

globalStyle(`.portal-loader__sprite--front`, {
  opacity: "calc(0.72 + var(--portal-speed-glow) * 0.28)",
  filter: "hue-rotate(88deg) saturate(1.75) brightness(1.2)",
  animation: `${portalSpritesheet} 4300ms steps(1, end) infinite reverse`,
});

globalStyle(`.portal-loader__core`, {
  position: "absolute",
  inset: "28%",
  borderRadius: "50%",
  background:
    "radial-gradient(circle at 50% 45%, rgba(254, 246, 255, 0.98) 0%, rgba(226, 184, 255, 0.95) 22%, rgba(190, 109, 255, 0.82) 46%, rgba(123, 72, 199, 0.6) 72%, rgba(68, 45, 113, 0.35) 100%)",
  boxShadow:
    "0 0 calc(16px + var(--portal-speed-glow) * 12px) rgba(221, 167, 255, calc(0.58 + var(--portal-speed-glow) * 0.32)), 0 0 calc(28px + var(--portal-speed-glow) * 24px) rgba(186, 250, 195, calc(0.26 + var(--portal-speed-glow) * 0.54)), inset 0 0 18px rgba(255, 246, 255, 0.4)",
});

globalStyle(`.portal-loader__core::after`, {
  content: "",
  position: "absolute",
  inset: "18%",
  borderRadius: "50%",
  background:
    "radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(218, 255, 227, 0.75) 36%, rgba(164, 246, 255, 0.18) 72%, transparent 100%)",
  filter: "blur(1px)",
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogFlash}`, {
  animation: `${flashPulse} 1.45s ease-out forwards`,
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogPackTopPiece}`, {
  animation: `${packTopRip} 1.6s cubic-bezier(0.18, 0.82, 0.24, 1) forwards`,
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogPackBodyPiece}`, {
  animation: `${packBodyRelease} 2.1s cubic-bezier(0.18, 0.82, 0.24, 1) forwards`,
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogPackMouth}`, {
  animation: `${packMouthGlow} 0.9s ease-out forwards`,
  animationDelay: "0.4s",
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogCut}`, {
  animation: `${cutSweep} 0.7s ease-out forwards`,
  animationDelay: "0.34s",
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogCardSlot}`, {
  animation: `${cardSpread} 0.72s cubic-bezier(0.14, 0.84, 0.24, 1) forwards`,
  animationDelay: "1.46s",
});

globalStyle(`${dialogBackdrop}[data-animate="true"] ${dialogCardInner}`, {
  animation: `${cardFlip} 0.5s ease-out forwards`,
  animationDelay: "2.02s",
});

globalStyle(`${dialogPackTrigger}:hover ${dialogPackStage}`, {
  transform: "translate(-50%, -50%) scale(1.04)",
});

globalStyle(`${dialogPackTrigger}:focus-visible ${dialogPackStage}`, {
  transform: "translate(-50%, -50%) scale(1.04)",
});

globalStyle(`${dialogPackTrigger}:hover ${dialogPackPromptBadge}`, {
  background: "rgba(255, 244, 215, 0.18)",
  borderColor: "rgba(255, 244, 215, 0.34)",
});

globalStyle(`${dialogPackTrigger}:focus-visible ${dialogPackPromptBadge}`, {
  background: "rgba(255, 244, 215, 0.18)",
  borderColor: "rgba(255, 244, 215, 0.34)",
});

globalStyle(
  `${dialogBackdrop}[data-revealed="true"] ${dialogCardSlot}[data-interactive="true"]:hover ${dialogCardButton}`,
  {
    transform: "scale(1.08)",
    filter: "brightness(1.04)",
  },
);

globalStyle(
  `${dialogBackdrop}[data-revealed="true"] ${dialogCardSlot}[data-interactive="true"]:focus-within ${dialogCardButton}`,
  {
    transform: "scale(1.08)",
    filter: "brightness(1.04)",
  },
);

globalStyle(`${dialogStaticCardButton}:hover ${dialogStaticCard}`, {
  transform: "translateY(-10px) scale(1.04)",
  boxShadow: "0 24px 36px rgba(0, 0, 0, 0.42)",
});

globalStyle(`${dialogStaticCardButton}:focus-visible ${dialogStaticCard}`, {
  transform: "translateY(-10px) scale(1.04)",
  boxShadow: "0 24px 36px rgba(0, 0, 0, 0.42)",
});

globalStyle(`${dialogBackdrop}[data-revealed="true"] ${dialogActions}`, {
  animation: `${revealFade} 0.28s ease-out forwards`,
});

globalStyle(`${dialogBackdrop}[data-revealed="false"] ${dialogActions}`, {
  opacity: 0,
  pointerEvents: "none",
});
