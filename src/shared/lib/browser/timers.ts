export const clearBrowserTimeout = (timer: number | null): null => {
  if (timer !== null) {
    window.clearTimeout(timer)
  }

  return null
}

export const restartTimeout = (
  timer: number | null,
  callback: () => void,
  delayMs: number,
): number => {
  clearBrowserTimeout(timer)
  return window.setTimeout(callback, delayMs)
}
