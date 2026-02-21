import { forwardRef } from 'react'

export const InfiniteLoader = forwardRef<HTMLDivElement>(function InfiniteLoader(
  _props,
  ref,
) {
  return (
    <div className="portal-loader" ref={ref} aria-hidden="true">
      <span className="portal-loader__aura" />
      <span className="portal-loader__speed-glow" />
      <span className="portal-loader__sprite portal-loader__sprite--back" />
      <span className="portal-loader__sprite portal-loader__sprite--front" />
      <span className="portal-loader__core" />
    </div>
  )
})
