import { createGlobalTheme } from '@vanilla-extract/css'

export const vars = createGlobalTheme(':root', {
  color: {
    text: '#f1f5f9',
    background: '#020617',
    panel: 'rgba(7, 14, 26, 0.84)',
    panelMuted: 'rgba(8, 14, 24, 0.72)',
    border: 'rgba(226, 232, 240, 0.28)',
    borderStrong: 'rgba(167, 243, 208, 0.75)',
    action: 'rgba(13, 28, 20, 0.9)',
    actionAlt: 'rgba(18, 28, 43, 0.9)',
    danger: 'rgba(252, 165, 165, 0.96)',
    success: 'rgba(134, 239, 172, 0.95)',
    info: 'rgba(203, 213, 225, 0.92)',
    rarityCommon: '#8fa0b7',
    rarityUncommon: '#55d091',
    rarityRare: '#5da8ff',
    rarityEpic: '#c789ff',
    rarityLegendary: '#f6c56f',
  },
  radius: {
    xs: '0.4rem',
    sm: '0.5rem',
    md: '0.74rem',
    lg: '0.86rem',
    pill: '999px',
  },
  space: {
    xxs: '0.25rem',
    xs: '0.45rem',
    sm: '0.62rem',
    md: '0.85rem',
    lg: '1rem',
    xl: '1.2rem',
  },
  font: {
    body: "'Avenir Next', 'Futura', 'Segoe UI', sans-serif",
    display: "'Metamorphous', 'Avenir Next', 'Futura', sans-serif",
  },
})
