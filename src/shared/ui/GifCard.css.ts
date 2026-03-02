import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { vars } from '../styles/theme.css'

export const card = recipe({
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: vars.radius.lg,
    background: vars.color.panel,
    boxShadow: `0 0 0 1px ${vars.color.border}, 0 16px 40px rgba(0, 0, 0, 0.46)`,
  },
  variants: {
    interactive: {
      true: {
        cursor: 'zoom-in',
        selectors: {
          '&:focus-visible': {
            outline: `2px solid ${vars.color.borderStrong}`,
            outlineOffset: '2px',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    interactive: false,
  },
})

export const image = style({
  display: 'block',
  width: '100%',
  minHeight: '180px',
  maxHeight: 'min(64vh, 520px)',
  objectFit: 'contain',
  background: 'rgba(0, 0, 0, 0.24)',
})

export const meta = style({
  display: 'grid',
  gap: '0.22rem',
  padding: `${vars.space.xs} ${vars.space.sm} ${vars.space.sm}`,
})

export const number = style({
  margin: 0,
  fontSize: '0.7rem',
  letterSpacing: '0.11em',
  textTransform: 'uppercase',
  color: 'rgba(226, 232, 240, 0.72)',
})

export const name = style({
  margin: 0,
  fontSize: '0.9rem',
  color: 'rgba(248, 250, 252, 0.98)',
})

export const collection = style({
  margin: 0,
  fontSize: '0.78rem',
  color: 'rgba(203, 213, 225, 0.86)',
})

export const rarity = style({
  margin: 0,
  fontSize: '0.76rem',
  color: 'rgba(203, 213, 225, 0.86)',
})

export const countBadge = style({
  position: 'absolute',
  top: vars.space.xs,
  left: vars.space.xs,
  zIndex: 2,
  minWidth: '2rem',
  borderRadius: vars.radius.pill,
  padding: '0.14rem 0.45rem',
  fontSize: '0.72rem',
  textAlign: 'center',
  fontWeight: '700',
  letterSpacing: '0.08em',
  background: 'rgba(22, 34, 56, 0.86)',
  border: `1px solid ${vars.color.border}`,
})

export const favoriteButton = style({
  position: 'absolute',
  top: vars.space.xs,
  right: vars.space.xs,
  zIndex: 2,
  width: '2rem',
  height: '2rem',
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelMuted,
  color: 'rgba(203, 213, 225, 0.95)',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      borderColor: 'rgba(253, 230, 138, 0.8)',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.borderStrong}`,
      outlineOffset: '1px',
    },
  },
})

export const favoriteButtonActive = style({
  color: '#ffd95a',
  borderColor: 'rgba(253, 230, 138, 0.82)',
  background: 'rgba(53, 41, 10, 0.9)',
})

export const actions = style({
  display: 'grid',
  gap: vars.space.xs,
  padding: `0 ${vars.space.sm} ${vars.space.sm}`,
})
