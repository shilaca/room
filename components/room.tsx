import { FC, useEffect, useRef, useState } from 'react'
import { CanvasTexture } from 'three'
import { AssetStore } from 'three-asset-store'
import { useEventListener } from '../hooks/eventListener'
import styles from '../styles/Room.module.scss'
import { App } from '../utils/app'

const Room: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [app, setApp] = useState<App>()
  const [assetsStore, setAssetsStore] = useState<AssetStore>()

  useEffect(() => {
    if (canvasRef.current) {
      const _assetStore = new AssetStore({
        useIDB: false,
        useWorker: false,
        dracoDir: '../node_modules/three-asset-store/dist/assets/draco'
      })
      setAssetsStore(_assetStore)
      const _app = new App(canvasRef.current)
      setApp(_app)
      // set up
      _assetStore
        .initialize()
        .then(_ =>
          _assetStore.getOrLoadAsset<ImageBitmap>(`/textures/uvChecker.png`)
        )
        .then(imageBitMap => {
          const texture = new CanvasTexture(imageBitMap as any)
          _app.initialize({
            floor: texture,
            ceiling: texture,
            wallC: texture,
            wallL: texture,
            wallR: texture
          })
          _app.start()
        })
    }
  }, [])

  useEventListener(globalThis, 'resize', (event: Event) => {
    if (app && canvasRef.current) {
      app.onResize(globalThis.innerWidth, globalThis.innerHeight)
    }
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
