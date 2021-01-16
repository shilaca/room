import {
  AmbientLight,
  AxesHelper,
  Clock,
  Group,
  PCFShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer
} from 'three'
import Tweakpane from 'tweakpane'
import { rad2Deg } from 'calc-lib'
import { Border } from './parts/border'

export class App {
  renderer: WebGLRenderer

  private scene: Scene
  private camera: PerspectiveCamera

  private cameraPos: Vector3
  private currentCameraLookAt: Vector3
  private cameraLookAt: Vector3

  private border: Border

  private pane: Tweakpane

  constructor(canvas: HTMLCanvasElement) {
    this.pane = new Tweakpane()

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true
    })
    this.renderer.setClearColor(0x051630)
    this.renderer.setPixelRatio(globalThis.devicePixelRatio || 1)
    // this.renderer.autoClear = false
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFShadowMap
    this.renderer.outputEncoding = sRGBEncoding

    this.scene = new Scene()
    this.scene.add(new AxesHelper(100))

    this.camera = new PerspectiveCamera(
      45,
      this.renderer.domElement.clientWidth /
        this.renderer.domElement.clientHeight,
      1,
      10000
    )
    this.cameraPos = new Vector3(0, 300, 300)
    this.currentCameraLookAt = new Vector3(0)
    this.cameraLookAt = new Vector3(0)

    // setup room border
    this.border = new Border()
    this.scene.add(this.border)

    // setup lights
    const ambient = new AmbientLight(0xfafafa)
    this.scene.add(ambient)

    const point01 = new PointLight(0xfafa00)
    point01.position.set(0, 10, 10)
    this.scene.add(point01)
    const point02 = new PointLight(0x00fafa)
    point02.position.set(0, 10, 10)
    this.scene.add(point02)

    // animation

    // debug settings
    const cameraPosRange = {
      min: -500,
      max: 500
    }
    const cameraParam = this.pane.addFolder({ title: 'Camera' })
    cameraParam.addInput(this.cameraPos, 'x', cameraPosRange)
    cameraParam.addInput(this.cameraPos, 'y', cameraPosRange)
    cameraParam.addInput(this.cameraPos, 'z', cameraPosRange)
    cameraParam.addInput(this.cameraLookAt, 'x', cameraPosRange)
    cameraParam.addInput(this.cameraLookAt, 'y', cameraPosRange)
    cameraParam.addInput(this.cameraLookAt, 'z', cameraPosRange)
  }

  /**
   * floor サイズの変更がある場合はこの関数が呼ばれる前に
   * calcFloorSize を呼ぶ
   * @param w window width
   * @param h window height
   */
  onResize(w: number, h: number): void {
    // camera の設定更新
    // fov: 高さが収まるように
    // posZ: floor のちょい内側
    const y = this.border.scale.y
    const z = this.border.scale.z
    const _fov = rad2Deg(Math.atan(y / 2 / z) * 2.6)
    this.camera.fov = _fov
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.cameraPos.set(0, y / 2, z / 2)
    this.cameraLookAt.set(0, y / 2, -z / 2)

    this.renderer.setSize(w, h, false)
  }

  /**
   *
   * @param x canvas.offsetX
   * @param y canvas.offsetY
   */
  onMousemove(x: number, y: number): void {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const wp = x / rect.width - 0.5
    const hp = 1 - y / rect.height

    const bw = this.border.scale.x
    const bh = this.border.scale.y

    const w = bw / 2
    const h = bh / 4
    this.cameraLookAt.set(
      w * wp,
      h * hp + (bh / 2 - h / 2),
      this.cameraLookAt.z
    )
  }

  start(): void {
    this.border.calcFloorSize()
    this.onResize(globalThis.innerWidth, globalThis.innerHeight)

    console.log('scene: ', this.scene)

    this.animate()
  }

  private animate(): void {
    // update camera
    const cameraPos = new Vector3()
    cameraPos.copy(this.camera.position)

    Object.entries(this.cameraLookAt).forEach(axis => {
      let prev = this.currentCameraLookAt[axis[0] as 'x' | 'y' | 'z']
      const next = axis[1]

      const delta = Math.abs(next - prev)
      const move = delta > 100 ? 1 : delta * 0.01
      if (prev > next) {
        prev -= move
        if (prev <= next) prev = next
      } else if (prev < next) {
        prev += move
        if (prev >= next) prev = next
      }

      this.currentCameraLookAt[axis[0] as 'x' | 'y' | 'z'] = prev
    })

    this.camera.position.copy(this.cameraPos)
    this.camera.lookAt(this.currentCameraLookAt)

    // render
    this.render()
    requestAnimationFrame(this.animate.bind(this))
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera)
  }
}
