import { recipe } from '@vanilla-extract/recipes'
import { styleVariants } from '@vanilla-extract/css'
import { vars } from './theme.css'

export const rarityText = styleVariants({
  common: { color: vars.color.rarityCommon },
  uncommon: { color: vars.color.rarityUncommon },
  rare: { color: vars.color.rarityRare },
  epic: { color: vars.color.rarityEpic },
  legendary: { color: vars.color.rarityLegendary },
})

export const rarityBorder = styleVariants({
  common: { boxShadow: `0 0 0 2px ${vars.color.rarityCommon}` },
  uncommon: { boxShadow: `0 0 0 2px ${vars.color.rarityUncommon}` },
  rare: { boxShadow: `0 0 0 2px ${vars.color.rarityRare}` },
  epic: { boxShadow: `0 0 0 2px ${vars.color.rarityEpic}` },
  legendary: { boxShadow: `0 0 0 2px ${vars.color.rarityLegendary}` },
})

export const actionButton = recipe({
  base: {
    minHeight: '2rem',
    borderRadius: vars.radius.sm,
    border: `1px solid ${vars.color.border}`,
    padding: `0 ${vars.space.sm}`,
    color: vars.color.text,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontSize: '0.74rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    selectors: {
      '&:hover': {
        borderColor: vars.color.borderStrong,
      },
      '&:disabled': {
        opacity: 0.55,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    tone: {
      primary: { background: vars.color.action },
      secondary: { background: vars.color.actionAlt },
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})
