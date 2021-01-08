import { useRef, useEffect } from 'react'

export function useResizeObserver(
  elements: Element | Element[] | null,
  handler: ResizeObserverCallback
): void {
  const savedHandler = useRef<ResizeObserverCallback>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!elements) return

    const resizeObserver = new ResizeObserver(handler)

    Array.isArray(elements)
      ? elements.forEach(el => resizeObserver.observe(el))
      : resizeObserver.observe(elements)

    return () => {
      resizeObserver.disconnect()
    }
  }, [elements])
}
