import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'

globalStyle(':root', {
  fontFamily: vars.font.body,
  fontWeight: '500',
  lineHeight: '1.2',
  color: vars.color.text,
  backgroundColor: vars.color.background,
  fontSynthesis: 'none',
  textRendering: 'geometricPrecision',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
})

globalStyle('html, body, #root', {
  width: '100%',
  height: '100%',
  margin: 0,
  overscrollBehavior: 'none',
})

globalStyle('body', {
  minWidth: '320px',
  overflow: 'clip',
})

globalStyle('button, input, select', {
  font: 'inherit',
})
