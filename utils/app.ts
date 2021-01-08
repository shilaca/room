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
import { Board } from './parts/board'

export class App {
  renderer: WebGLRenderer

  private scene: Scene
  private camera: PerspectiveCamera

  private cameraPos: Vector3
  private currentCameraLookAt: Vector3
  private cameraLookAt: Vector3

  private border: Group
  private floor: Board
  private wallC: Board
  private wallL: Board
  private wallR: Board
  private ceiling: Board

  private clock: Clock

  private pane: Tweakpane

  constructor(canvas: HTMLCanvasElement) {
    this.pane = new Tweakpane()

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true
    })
    this.renderer.setClearColor(0xffffff)
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
    this.border = new Group()
    this.scene.add(this.border)

    this.floor = new Board(0x333333)
    this.floor.rotateX(-Math.PI / 2)
    this.border.add(this.floor)

    this.ceiling = new Board(0x333333)
    this.ceiling.position.set(0, 1, 0)
    this.ceiling.rotateX(Math.PI / 2)
    this.border.add(this.ceiling)

    this.wallC = new Board(0x00fafa)
    this.wallC.position.set(0, 0.5, -0.5)
    this.border.add(this.wallC)

    this.wallL = new Board(0xfa00fa)
    this.wallL.rotateY(Math.PI / 2)
    this.wallL.position.set(-0.5, 0.5, 0)
    this.border.add(this.wallL)

    this.wallR = new Board(0xfafa00)
    this.wallR.rotateY(-Math.PI / 2)
    this.wallR.position.set(0.5, 0.5, 0)
    this.border.add(this.wallR)

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
    this.clock = new Clock(false)

    // debug settings
    const cameraPosRange = {
      min: -300,
      max: 300
    }
    const cameraParam = this.pane.addFolder({ title: 'Camera' })
    cameraParam.addInput(this.cameraPos, 'x', cameraPosRange)
    cameraParam.addInput(this.cameraPos, 'y', cameraPosRange)
    cameraParam.addInput(this.cameraPos, 'z', cameraPosRange)
    cameraParam.addInput(this.cameraLookAt, 'x', cameraPosRange)
    cameraParam.addInput(this.cameraLookAt, 'y', cameraPosRange)
    cameraParam.addInput(this.cameraLookAt, 'z', cameraPosRange)

    const wallsParam = this.pane.addFolder({ title: 'walls' })
    const rotateRange = {
      min: -Math.PI,
      max: Math.PI
    }
    const cr = wallsParam.addFolder({ title: 'center' })
    cr.addInput(this.wallC.rotation, 'x', rotateRange)
    cr.addInput(this.wallC.rotation, 'y', rotateRange)
    cr.addInput(this.wallC.rotation, 'z', rotateRange)
    const lr = wallsParam.addFolder({ title: 'left' })
    lr.addInput(this.wallL.rotation, 'x', rotateRange)
    lr.addInput(this.wallL.rotation, 'y', rotateRange)
    lr.addInput(this.wallL.rotation, 'z', rotateRange)
    const rr = wallsParam.addFolder({ title: 'right' })
    rr.addInput(this.wallR.rotation, 'x', rotateRange)
    rr.addInput(this.wallR.rotation, 'y', rotateRange)
    rr.addInput(this.wallR.rotation, 'z', rotateRange)
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
    this.calcFloorSize()
    this.onResize(globalThis.innerWidth, globalThis.innerHeight)

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

  /**
   * floor のリサイズ
   * @param n 何畳？
   */
  private calcFloorSize(n = 6): void {
    // 畳サイズ (中京間) [cm]
    const tatami = {
      w: 182,
      h: 91,
      t: 60
    }
    switch (n) {
      case 6:
        this.border.scale.set(tatami.w * 2, 236, tatami.w + tatami.h)
        break

      default:
        console.warn('this floor size is undefined: ', n)
        break
    }
  }
}
