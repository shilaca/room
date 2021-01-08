import { useRef, useEffect } from 'react'

type _EventListener<K extends Event> = (event: K) => void

export function useEventListener<T extends Event>(
  element: HTMLElement | Window | null,
  eventName: string,
  handler: _EventListener<T>
): void {
  const savedHandler = useRef<_EventListener<T>>()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!(element && element.addEventListener)) return

    const eventListener = (event: T) =>
      savedHandler.current && savedHandler.current(event)

    element.addEventListener(
      eventName,
      eventListener as EventListenerOrEventListenerObject
    )

    return () => {
      element.removeEventListener(
        eventName,
        eventListener as EventListenerOrEventListenerObject
      )
    }
  }, [eventName, element])
}
