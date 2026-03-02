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
  overflowY: 'auto',
  padding: '5.4rem clamp(1rem, 4vw, 2.2rem) clamp(1.2rem, 3vw, 1.9rem)',
})

export const container = style({
  width: 'min(1200px, 100%)',
  margin: '0 auto',
})

export const header = style({
  display: 'grid',
  gap: vars.space.xs,
})

export const title = style({
  margin: 0,
  fontSize: 'clamp(1.35rem, 2.8vw, 2rem)',
  letterSpacing: '0.04em',
  fontFamily: vars.font.display,
})

export const subtitle = style({
  margin: 0,
  fontSize: '0.92rem',
  color: 'rgba(226, 232, 240, 0.88)',
})

export const transferRow = style({
  marginTop: vars.space.xs,
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.xs,
})

export const statusMessage = style({
  margin: 0,
  fontSize: '0.8rem',
})

export const statusInfo = style({ color: vars.color.info })
export const statusSuccess = style({ color: vars.color.success })
export const statusError = style({ color: vars.color.danger })

export const filtersWrap = style({
  marginTop: vars.space.md,
  padding: vars.space.sm,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: 'rgba(5, 12, 20, 0.62)',
  display: 'flex',
  alignItems: 'flex-end',
  gap: vars.space.sm,
  flexWrap: 'wrap',
})

export const filterToggle = style({
  minHeight: '2rem',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  fontSize: '0.76rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.92)',
})

export const filterField = style({
  display: 'grid',
  gap: '0.28rem',
  flex: '1 1 220px',
  minWidth: '170px',
})

export const filterLabel = style({
  fontSize: '0.68rem',
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'rgba(203, 213, 225, 0.86)',
})

export const multiSelect = style({
  position: 'relative',
  minWidth: 0,
})

export const multiSelectTrigger = style({
  listStyle: 'none',
  minHeight: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: 'rgba(8, 14, 24, 0.82)',
  color: vars.color.text,
  padding: '0.38rem 0.52rem',
  fontSize: '0.78rem',
  cursor: 'pointer',
})

export const multiSelectMenu = style({
  position: 'absolute',
  zIndex: 12,
  top: 'calc(100% + 0.25rem)',
  left: 0,
  right: 0,
  display: 'grid',
  gap: '0.3rem',
  maxHeight: '15rem',
  overflowY: 'auto',
  padding: vars.space.xs,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.sm,
  background: 'rgba(9, 18, 31, 0.96)',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.42)',
})

export const multiSelectOption = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.42rem',
  fontSize: '0.76rem',
  color: vars.color.text,
})

export const emptyState = style({
  marginTop: vars.space.lg,
  padding: `${vars.space.md} ${vars.space.lg}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: 'rgba(5, 12, 20, 0.6)',
  fontSize: '0.9rem',
})

export const grid = style({
  marginTop: vars.space.lg,
  display: 'grid',
  gap: '0.9rem',
  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
})

export const cardActions = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: vars.space.xs,
})

export const shareButton = style({
  gridColumn: '1 / -1',
})

export const modal = style({
  position: 'fixed',
  inset: 0,
  zIndex: 130,
  display: 'grid',
  placeItems: 'center',
  padding: vars.space.lg,
  background: 'rgba(2, 6, 23, 0.75)',
  backdropFilter: 'blur(3px)',
})

export const modalCard = style({
  width: 'min(92vw, 660px)',
  maxHeight: '90vh',
})

export const modalActions = style({
  padding: `0 ${vars.space.sm} ${vars.space.sm}`,
  display: 'grid',
})
