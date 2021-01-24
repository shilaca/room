import { FC, useEffect, useRef, useState } from 'react'
import { CanvasTexture } from 'three'
import { AssetStore } from 'three-asset-store'
import { useEventListener } from '../hooks/eventListener'
import { useResizeObserver } from '../hooks/resizeObserver'
import styles from '../styles/Room.module.scss'
import { App } from '../utils/app'

const Room: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [app, setApp] = useState<App>()
  const [assetsStore, setAssetsStore] = useState<AssetStore>()

  useEffect(() => {
    const _assetsStore = new AssetStore({
      useIDB: false,
      useWorker: false,
      dracoDir: '../node_modules/three-asset-store/dist/assets/draco'
    })
    _assetsStore
      .initialize()
      .then(_ =>
        _assetsStore.getOrLoadAsset<ImageBitmap>(`/textures/uvChecker.png`)
      )
      .then(imageBitMap => {
        const texture = new CanvasTexture(imageBitMap as any)
        console.log('loadedd ', texture)
        if (canvasRef.current) {
          const _app = new App(canvasRef.current, {
            floor: texture,
            ceiling: texture,
            wallC: texture,
            wallL: texture,
            wallR: texture
          })
          _app.start()
          setApp(_app)
        }
      })
    setAssetsStore(_assetsStore)
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
