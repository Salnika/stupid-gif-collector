import { globalStyle, keyframes, style } from '@vanilla-extract/css'
import { vars } from '../../../shared/styles/theme.css'

export const page = style({
  width: '100%',
  minHeight: '100%',
  backgroundImage: "url('/background.jpg')",
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
})

export const scrollStage = style({
  position: 'fixed',
  inset: 0,
  overflow: 'auto',
  overscrollBehavior: 'none',
  touchAction: 'none',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
})

globalStyle(`${scrollStage}::-webkit-scrollbar`, {
  width: 0,
  height: 0,
  display: 'none',
})

export const content = style({
  width: '100%',
  minHeight: '500vh',
  visibility: 'hidden',
  pointerEvents: 'none',
})

export const spacer = style({
  height: '500vh',
})

export const overlay = style({
  vars: {
    '--glyph-visibility': '0',
    '--glyph-shift': '0',
  },
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 40,
})

export const attempt = style({
  position: 'absolute',
  top: 'clamp(0.95rem, 2vw, 1.2rem)',
  left: '50%',
  margin: 0,
  transform: 'translateX(-50%)',
  padding: '0.24rem 0.58rem',
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  background: 'rgba(8, 14, 24, 0.6)',
  fontSize: '0.72rem',
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.92)',
  zIndex: 48,
})

export const loaderAnchor = style({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  zIndex: 42,
})

export const counter = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  margin: 0,
  transform: 'translate(-50%, -50%)',
  fontSize: 'clamp(2.2rem, 8vw, 5.2rem)',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'rgba(241, 245, 249, 0.88)',
  textShadow: '0 0 24px rgba(159, 254, 167, 0.28), 0 0 40px rgba(190, 126, 255, 0.26)',
  fontVariantNumeric: 'tabular-nums',
  zIndex: 44,
})

export const hint = style({
  position: 'absolute',
  bottom: 'clamp(1.5rem, 4vw, 2.5rem)',
  left: '50%',
  margin: 0,
  transform: 'translateX(-50%)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontSize: 'clamp(0.7rem, 1.6vw, 0.82rem)',
  color: 'rgba(226, 232, 240, 0.7)',
  zIndex: 43,
})

export const selectedCard = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'min(88vw, 420px)',
  zIndex: 47,
})

export const popup = style({
  position: 'absolute',
  inset: 0,
  display: 'grid',
  justifyItems: 'center',
  alignContent: 'center',
  gap: vars.space.md,
  pointerEvents: 'auto',
  zIndex: 90,
  background: 'rgba(2, 6, 23, 0.38)',
})

export const popupCard = style({
  width: 'min(88vw, 420px)',
})

export const popupActions = style({
  display: 'flex',
  gap: vars.space.xs,
  flexWrap: 'wrap',
  justifyContent: 'center',
})

export const candidateActions = style({
  position: 'absolute',
  left: '50%',
  bottom: 'clamp(4.8rem, 13vh, 7rem)',
  transform: 'translateX(-50%)',
  display: 'grid',
  justifyItems: 'center',
  gap: vars.space.xs,
  zIndex: 89,
  pointerEvents: 'auto',
})

export const candidateHelp = style({
  margin: 0,
  fontSize: '0.76rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.88)',
  textShadow: '0 2px 8px rgba(0, 0, 0, 0.34)',
})

export const newFlagHero = style({
  position: 'absolute',
  top: '-1.35rem',
  left: '50%',
  transform: 'translateX(-50%) rotate(-6deg)',
  fontSize: 'clamp(1.45rem, 5vw, 2.45rem)',
  zIndex: 3,
  margin: 0,
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#ffe66d',
  textShadow: '0 2px 0 #4a3014, 0 4px 12px rgba(0, 0, 0, 0.48), 0 0 18px rgba(253, 224, 71, 0.56)',
  WebkitTextStroke: '1px rgba(58, 33, 11, 0.9)',
})

export const newFlagPopup = style({
  margin: 0,
  fontWeight: 900,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#ffe66d',
  transform: 'rotate(-4deg)',
  fontSize: 'clamp(1.25rem, 3.8vw, 2.1rem)',
  textShadow: '0 2px 0 #4a3014, 0 4px 12px rgba(0, 0, 0, 0.48), 0 0 18px rgba(253, 224, 71, 0.56)',
  WebkitTextStroke: '1px rgba(58, 33, 11, 0.9)',
})

const portalPulse = keyframes({
  '0%, 100%': {
    transform: 'scale(0.98)',
    opacity: 0.88,
  },
  '50%': {
    transform: 'scale(1.06)',
    opacity: 1,
  },
})

const portalSpritesheet = keyframes({
  '0%': { backgroundPosition: '0 0' },
  '6.25%': { backgroundPosition: 'calc(var(--loader-size) * -1) 0' },
  '12.5%': { backgroundPosition: 'calc(var(--loader-size) * -2) 0' },
  '18.75%': { backgroundPosition: 'calc(var(--loader-size) * -3) 0' },
  '25%': { backgroundPosition: '0 calc(var(--loader-size) * -1)' },
  '31.25%': { backgroundPosition: 'calc(var(--loader-size) * -1) calc(var(--loader-size) * -1)' },
  '37.5%': { backgroundPosition: 'calc(var(--loader-size) * -2) calc(var(--loader-size) * -1)' },
  '43.75%': { backgroundPosition: 'calc(var(--loader-size) * -3) calc(var(--loader-size) * -1)' },
  '50%': { backgroundPosition: '0 calc(var(--loader-size) * -2)' },
  '56.25%': { backgroundPosition: 'calc(var(--loader-size) * -1) calc(var(--loader-size) * -2)' },
  '62.5%': { backgroundPosition: 'calc(var(--loader-size) * -2) calc(var(--loader-size) * -2)' },
  '68.75%': { backgroundPosition: 'calc(var(--loader-size) * -3) calc(var(--loader-size) * -2)' },
  '75%': { backgroundPosition: '0 calc(var(--loader-size) * -3)' },
  '81.25%': { backgroundPosition: 'calc(var(--loader-size) * -1) calc(var(--loader-size) * -3)' },
  '87.5%': { backgroundPosition: 'calc(var(--loader-size) * -2) calc(var(--loader-size) * -3)' },
  '93.75%, 100%': { backgroundPosition: 'calc(var(--loader-size) * -3) calc(var(--loader-size) * -3)' },
})

globalStyle('.portal-glyphs', {
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  opacity: 'var(--glyph-visibility)',
  zIndex: 46,
})

globalStyle('.portal-glyphs::before', {
  content: '',
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 58% 34%, rgba(167, 139, 250, calc(var(--glyph-visibility) * 0.14)) 0%, rgba(139, 92, 246, calc(var(--glyph-visibility) * 0.08)) 34%, transparent 68%)',
})

globalStyle('.portal-glyphs__column', {
  position: 'absolute',
  top: 0,
  height: '100%',
  width: 'clamp(2rem, 3.8vw, 3.7rem)',
  color: 'rgba(195, 149, 255, 0.72)',
  textShadow: '0 0 5px rgba(167, 139, 250, 0.4), 0 0 11px rgba(139, 92, 246, 0.22)',
  opacity: 'calc(0.06 + var(--glyph-visibility) * 0.22)',
  overflow: 'hidden',
})

globalStyle('.portal-glyphs__track', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '220%',
  gap: '0.7rem',
  transform:
    'translate3d(0, calc(((var(--glyph-shift) * var(--glyph-rate) + var(--glyph-phase)) * var(--glyph-direction) * 1%)), 0)',
  willChange: 'transform',
})

globalStyle('.portal-glyphs__line', {
  fontSize: 'clamp(4.2rem, 7.6vw, 6.6rem)',
  fontWeight: 700,
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  fontFamily:
    "'Noto Sans Runic', 'Metamorphous', 'Noto Sans Symbols 2', 'Segoe UI Symbol', 'Apple Symbols', serif",
})

globalStyle('.portal-loader', {
  vars: {
    '--loader-size': 'min(32vw, 16rem)',
    '--portal-speed-glow': '0',
  },
  position: 'relative',
  width: 'var(--loader-size)',
  aspectRatio: '1 / 1',
  borderRadius: '50%',
  willChange: 'transform',
})

globalStyle('.portal-loader__aura', {
  position: 'absolute',
  inset: '-6%',
  borderRadius: '50%',
  background:
    'radial-gradient(circle, rgba(183, 87, 255, 0.18) 0%, rgba(183, 87, 255, 0.04) 58%, transparent 72%), radial-gradient(circle, rgba(141, 255, 148, 0.33) 35%, rgba(141, 255, 148, 0.06) 70%, transparent 90%)',
  opacity: 'calc(0.75 + var(--portal-speed-glow) * 0.25)',
  filter: 'blur(calc(8px + var(--portal-speed-glow) * 7px))',
  animation: `${portalPulse} 2.4s ease-in-out infinite`,
})

globalStyle('.portal-loader__speed-glow', {
  position: 'absolute',
  inset: '-14%',
  borderRadius: '50%',
  background:
    'radial-gradient(circle, rgba(170, 86, 255, 0.7) 0%, rgba(170, 86, 255, 0.18) 42%, transparent 70%), radial-gradient(circle, rgba(148, 255, 177, 0.8) 22%, rgba(148, 255, 177, 0.12) 58%, transparent 84%)',
  opacity: 'calc(0.12 + var(--portal-speed-glow) * 0.88)',
  transform: 'scale(calc(0.9 + var(--portal-speed-glow) * 0.22))',
  filter: 'blur(calc(6px + var(--portal-speed-glow) * 12px))',
})

globalStyle('.portal-loader__sprite', {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  backgroundImage: "url('/assets/portal/teleport-circle-spritesheet.png')",
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'calc(var(--loader-size) * 4) calc(var(--loader-size) * 4)',
  mixBlendMode: 'screen',
})

globalStyle('.portal-loader__sprite--back', {
  opacity: 'calc(0.74 + var(--portal-speed-glow) * 0.26)',
  filter: 'hue-rotate(118deg) saturate(1.8) brightness(1.06) blur(2px)',
  animation: `${portalSpritesheet} 5600ms steps(1, end) infinite`,
})

globalStyle('.portal-loader__sprite--front', {
  opacity: 'calc(0.72 + var(--portal-speed-glow) * 0.28)',
  filter: 'hue-rotate(88deg) saturate(1.75) brightness(1.2)',
  animation: `${portalSpritesheet} 4300ms steps(1, end) infinite reverse`,
})

globalStyle('.portal-loader__core', {
  position: 'absolute',
  inset: '28%',
  borderRadius: '50%',
  background:
    'radial-gradient(circle at 50% 45%, rgba(254, 246, 255, 0.98) 0%, rgba(226, 184, 255, 0.95) 22%, rgba(190, 109, 255, 0.82) 46%, rgba(123, 72, 199, 0.6) 72%, rgba(68, 45, 113, 0.35) 100%)',
  boxShadow:
    '0 0 calc(16px + var(--portal-speed-glow) * 12px) rgba(221, 167, 255, calc(0.58 + var(--portal-speed-glow) * 0.32)), 0 0 calc(28px + var(--portal-speed-glow) * 24px) rgba(186, 250, 195, calc(0.26 + var(--portal-speed-glow) * 0.54)), inset 0 0 18px rgba(255, 246, 255, 0.4)',
})

globalStyle('.portal-loader__core::after', {
  content: '',
  position: 'absolute',
  inset: '18%',
  borderRadius: '50%',
  background:
    'radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(218, 255, 227, 0.75) 36%, rgba(164, 246, 255, 0.18) 72%, transparent 100%)',
  filter: 'blur(1px)',
})
