import { style } from '@vanilla-extract/css'
import { vars } from '../../../shared/styles/theme.css'

export const page = style({
  width: '100%',
  minHeight: '100%',
  backgroundImage: "url('/background.jpg')",
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  position: 'fixed',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  overflow: 'auto',
  padding: vars.space.xl,
})

export const container = style({
  width: 'min(92vw, 560px)',
  display: 'grid',
  justifyItems: 'center',
  gap: vars.space.md,
})

export const card = style({
  width: '100%',
})

export const stateBlock = style({
  display: 'grid',
  gap: vars.space.xs,
  justifyItems: 'center',
})

export const state = style({
  margin: 0,
  fontSize: '0.92rem',
  color: 'rgba(226, 232, 240, 0.95)',
})
