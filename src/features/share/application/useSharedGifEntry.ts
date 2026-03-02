import { useEffect, useMemo, useState } from 'react'
import { getEntryByNumber } from '../../catalog/data'
import type { GifCatalogEntry } from '../../catalog/domain'

const parseNumberParam = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const number = Number.parseInt(value, 10)
  if (!Number.isFinite(number) || number < 1) {
    return null
  }

  return number
}

export const useSharedGifEntry = (rawGifNumber: string | undefined) => {
  const requestedNumber = useMemo(() => parseNumberParam(rawGifNumber), [rawGifNumber])
  const [isLoading, setIsLoading] = useState(true)
  const [entry, setEntry] = useState<GifCatalogEntry | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadEntry = async () => {
      if (requestedNumber === null) {
        setEntry(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const nextEntry = await getEntryByNumber(requestedNumber)
        if (cancelled) {
          return
        }

        setEntry(nextEntry)
      } catch {
        if (cancelled) {
          return
        }

        setEntry(null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadEntry()

    return () => {
      cancelled = true
    }
  }, [requestedNumber])

  return {
    isLoading,
    entry,
  }
}
