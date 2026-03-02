import { style } from '@vanilla-extract/css'
import { vars } from '../shared/styles/theme.css'

export const nav = style({
  position: 'fixed',
  top: 'clamp(0.8rem, 2vw, 1.2rem)',
  left: 'clamp(0.8rem, 2vw, 1.2rem)',
  display: 'flex',
  gap: vars.space.xs,
  zIndex: 120,
})

export const navButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '2rem',
  padding: '0 0.72rem',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelMuted,
  color: 'rgba(241, 245, 249, 0.92)',
  textDecoration: 'none',
  fontSize: '0.78rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  transition: 'background-color 160ms ease, border-color 160ms ease, color 160ms ease',
  selectors: {
    '&:hover': {
      background: 'rgba(15, 22, 36, 0.88)',
      borderColor: vars.color.borderStrong,
      color: '#f8fafc',
    },
  },
})

export const navButtonActive = style({
  borderColor: 'rgba(148, 255, 177, 0.8)',
  background: 'rgba(24, 41, 31, 0.82)',
  color: '#ecfeff',
})

export const githubLink = style({
  position: 'fixed',
  top: 'clamp(0.8rem, 2vw, 1.2rem)',
  right: 'clamp(0.8rem, 2vw, 1.2rem)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.12rem',
  height: '2.12rem',
  borderRadius: vars.radius.xs,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.panelMuted,
  color: '#fff',
  zIndex: 120,
  transition: 'background-color 160ms ease, border-color 160ms ease',
  selectors: {
    '&:hover': {
      background: 'rgba(15, 22, 36, 0.88)',
      borderColor: vars.color.borderStrong,
    },
  },
})

export const githubIcon = style({
  width: '1.16rem',
  height: '1.16rem',
  display: 'block',
})
