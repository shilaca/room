import { FC, useEffect, useRef, useState } from 'react'
import { useEventListener } from '../hooks/eventListener'
import { useResizeObserver } from '../hooks/resizeObserver'
import styles from '../styles/Room.module.scss'
import { App } from '../utils/app'

const Room: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [app, setApp] = useState<App>()

  useEffect(() => {
    if (canvasRef.current) {
      const _app = new App(canvasRef.current)
      _app.start()
      setApp(_app)
    }
  }, [])

  useResizeObserver(canvasRef.current, entries => {
    entries.forEach(entry => {
      app?.onResize(entry.contentRect.width, entry.contentRect.height)
    })
  })

  useEventListener(canvasRef.current, 'mousemove', (event: MouseEvent) => {
    const x = event.offsetX
    const y = event.offsetY
    app?.onMousemove(x, y)
  })

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={canvasRef}></canvas>
    </div>
  )
}
export default Room
