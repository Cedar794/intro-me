import { useEffect, useState } from 'react'

function readMatch(query: string) {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => readMatch(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setMatches(false)
      return undefined
    }

    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener?.(update)
    return () => media.removeListener?.(update)
  }, [query])

  return matches
}
