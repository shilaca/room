import {
  AmbientLight,
  AxesHelper,
  Color,
  Layers,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PointLight,
  ReinhardToneMapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  sRGBEncoding,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  Texture,
  RGBAFormat,
  LinearFilter
} from 'three'
import Tweakpane from 'tweakpane'
import { rad2Deg } from 'calc-lib'
import { Border } from './parts/border'
import VERT_MAIN from '../shader/main.vert'
import FRAG_MAIN from '../shader/main.frag'

export class App {
  static LAYER_MAIN = 0
  static LAYER_BLOOM = 10
  static LAYER_BLOOM_ESC = 9

  private initialized = false

  private layerBloom: Layers
  private layerBloomEsc: Layers
  private darkMaterial: MeshBasicMaterial
  private materials: { [key: string]: Material | Material[] }

  private renderer: WebGLRenderer

  private _bloomComposer: any | undefined
  // private _bloomComposer: EffectComposer | undefined
  private get bloomComposer() {
    if (this._bloomComposer) return this._bloomComposer
    else throw new ReferenceError('Please run initialze()')
  }
  private set bloomComposer(v) {
    this._bloomComposer = v
  }
  private _mainComposer: any | undefined
  // private _mainComposer: EffectComposer | undefined
  private get mainComposer() {
    if (this._mainComposer) return this._mainComposer
    else throw new ReferenceError('Please run initialze()')
  }
  private set mainComposer(v) {
    this._mainComposer = v
  }

  private scene: Scene
  private camera: PerspectiveCamera

  private cameraPos: Vector3
  private currentCameraLookAt: Vector3
  private cameraLookAt: Vector3

  private _border: Border | undefined
  private get border(): Border {
    if (this._border) return this._border
    else throw new ReferenceError('Please run initialze()')
  }
  private set border(b: Border) {
    this._border = b
  }

  // debug
  private pane: Tweakpane

  constructor(
    canvas: HTMLCanvasElement,
    private clearColor: number = 0x051630
  ) {
    this.pane = new Tweakpane()

    // setup
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    })
    this.renderer.setClearColor(this.clearColor, 0)
    this.renderer.setPixelRatio(globalThis.devicePixelRatio || 1)
    // this.renderer.autoClear = false
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFShadowMap
    this.renderer.outputEncoding = sRGBEncoding
    this.renderer.toneMapping = ReinhardToneMapping

    this.layerBloom = new Layers()
    this.layerBloom.set(App.LAYER_BLOOM)
    this.layerBloomEsc = new Layers()
    this.layerBloomEsc.set(App.LAYER_BLOOM_ESC)
    this.darkMaterial = new MeshBasicMaterial({ color: 0x000000 })
    this.materials = {}

    this.scene = new Scene()
    this.scene.background = null

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

    // setup lights
    const ambient = new AmbientLight(0xdddddd)
    this.scene.add(ambient)

    const pointLight01 = new PointLight(0xdd0000)
    pointLight01.position.set(-100, 100, -100)
    this.scene.add(pointLight01)
    const pointLight02 = new PointLight(0x0000dd)
    pointLight02.position.set(100, 100, -100)
    this.scene.add(pointLight02)

    // debug settings
    // const cameraPosRange = {
    //   min: -500,
    //   max: 500
    // }
    // const cameraParam = this.pane.addFolder({ title: 'Camera' })
    // cameraParam.addInput(this.cameraPos, 'x', cameraPosRange)
    // cameraParam.addInput(this.cameraPos, 'y', cameraPosRange)
    // cameraParam.addInput(this.cameraPos, 'z', cameraPosRange)
    // cameraParam.addInput(this.cameraLookAt, 'x', cameraPosRange)
    // cameraParam.addInput(this.cameraLookAt, 'y', cameraPosRange)
    // cameraParam.addInput(this.cameraLookAt, 'z', cameraPosRange)
    // const bloomParam = this.pane.addFolder({ title: 'Bloom' })
    // bloomParam.addInput(bloomPass, 'strength', { min: 0.0, max: 10.0 })
    // bloomParam.addInput(bloomPass, 'radius', { min: 0.0, max: 1.0, step: 0.01 })
    // bloomParam.addInput(bloomPass, 'threshold', {
    //   min: 0.0,
    //   max: 1.0,
    //   step: 0.01
    // })
    const appearBtn = this.pane.addButton({
      title: 'Appear'
    })
    appearBtn.on('click', () => this.border.appear())
    const disappearBtn = this.pane.addButton({
      title: 'Disappear'
    })
    disappearBtn.on('click', () => this.border.disappear())
  }

  async initialize(textures: {
    floor: Texture
    ceiling: Texture
    wallC: Texture
    wallL: Texture
    wallR: Texture
  }): Promise<void> {
    const { EffectComposer } = await import(
      'three/examples/jsm/postprocessing/EffectComposer'
    )
    const { RenderPass } = await import(
      'three/examples/jsm/postprocessing/RenderPass'
    )
    const { ShaderPass } = await import(
      'three/examples/jsm/postprocessing/ShaderPass'
    )
    const { UnrealBloomPass } = await import(
      'three/examples/jsm/postprocessing/UnrealBloomPass'
    )

    // setup Composer
    const bloomRenderScene = new RenderPass(this.scene, this.camera)
    const bloomPass = new UnrealBloomPass(
      new Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      ),
      0.6,
      0.2,
      0.2
    )
    this.bloomComposer = new EffectComposer(this.renderer)
    this.bloomComposer.renderToScreen = false
    this.bloomComposer.addPass(bloomRenderScene)
    this.bloomComposer.addPass(bloomPass)

    const mainRenderScene = new RenderPass(this.scene, this.camera)
    const mainPass = new ShaderPass(
      new ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
        },
        vertexShader: VERT_MAIN,
        fragmentShader: FRAG_MAIN
      }),
      'baseTexture'
    )
    mainPass.needsSwap = true
    this.mainComposer = new EffectComposer(this.renderer)
    this.mainComposer.addPass(mainRenderScene)
    this.mainComposer.addPass(mainPass)

    // setup object
    this.scene.traverse(this.disposeMaterial.bind(this))

    this.border = new Border(textures)
    this.scene.add(this.border)

    const color = new Color()
    color.setHSL(0.5, 0.7, 0.2 + 0.05)
    const mesh = new Mesh(
      new SphereGeometry(100),
      new MeshLambertMaterial({
        color
        // transparent: true,
        // opacity: 0.4
      })
    )
    this.scene.add(mesh)

    // animation
    this.initialized = true
  }

  /**
   * floor サイズの変更がある場合はこの関数が呼ばれる前に
   * calcFloorSize を呼ぶ
   * @param w window width
   * @param h window height
   */
  onResize(w: number, h: number): void {
    if (!this.initialized) return
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

    this.bloomComposer.setSize(w, h)
    this.mainComposer.setSize(w, h)
  }

  /**
   *
   * @param x canvas.offsetX
   * @param y canvas.offsetY
   */
  onMousemove(x: number, y: number): void {
    if (!this.initialized) return
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
    if (!this.initialized) return
    this.border.calcFloorSize()
    this.onResize(globalThis.innerWidth, globalThis.innerHeight)

    console.log('scene: ', this.scene)

    this.border.clock.start()

    this.animate()
  }

  private animate(): void {
    // update scene
    this.border.update()

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
    this.border.switch('wire')
    this.scene.traverse(this.darkenNonBloomed.bind(this))
    this.bloomComposer.render()
    this.border.switch('fill')
    this.scene.traverse(this.restoreMaterial.bind(this))
    this.mainComposer.render()
    // this.renderer.render(this.scene, this.camera)
  }

  private disposeMaterial(_obj: Object3D): void {
    const obj = _obj as Mesh
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
      else obj.material.dispose()
    }
  }

  private darkenNonBloomed(_obj: Object3D): void {
    const obj = _obj as Mesh
    if (
      obj.isMesh &&
      !(this.layerBloom.test(obj.layers) || this.layerBloomEsc.test(obj.layers))
    ) {
      this.materials[obj.uuid] = obj.material
      obj.material = this.darkMaterial
    }
  }

  private restoreMaterial(_obj: Object3D): void {
    const obj = _obj as Mesh
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid]
      delete this.materials[obj.uuid]
    }
  }
}
