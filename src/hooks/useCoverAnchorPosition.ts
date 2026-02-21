import { useEffect, useMemo, useState, type RefObject } from 'react'

type Size = {
  width: number
  height: number
}

type Point = {
  x: number
  y: number
}

type UseCoverAnchorPositionParams = {
  containerRef: RefObject<HTMLElement | null>
  imageSize: Size
  anchor: Point
}

const getCoverAnchorPosition = (
  containerSize: Size,
  imageSize: Size,
  anchor: Point,
): Point => {
  const scale = Math.max(
    containerSize.width / imageSize.width,
    containerSize.height / imageSize.height,
  )

  const renderedWidth = imageSize.width * scale
  const renderedHeight = imageSize.height * scale
  const offsetX = (containerSize.width - renderedWidth) / 2
  const offsetY = (containerSize.height - renderedHeight) / 2

  return {
    x: offsetX + anchor.x * scale,
    y: offsetY + anchor.y * scale,
  }
}

export function useCoverAnchorPosition({
  containerRef,
  imageSize,
  anchor,
}: UseCoverAnchorPositionParams): Point {
  const initialPoint = useMemo(
    () => getCoverAnchorPosition(imageSize, imageSize, anchor),
    [anchor, imageSize],
  )
  const [point, setPoint] = useState<Point>(initialPoint)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const updatePoint = () => {
      setPoint(
        getCoverAnchorPosition(
          {
            width: container.clientWidth,
            height: container.clientHeight,
          },
          imageSize,
          anchor,
        ),
      )
    }

    updatePoint()

    const resizeObserver = new ResizeObserver(updatePoint)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [anchor, containerRef, imageSize])

  return point
}
