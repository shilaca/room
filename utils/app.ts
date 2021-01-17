import {
  AmbientLight,
  AxesHelper,
  Color,
  Layers,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  ReinhardToneMapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  sRGBEncoding,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three'
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js'
import Tweakpane from 'tweakpane'
import { rad2Deg } from 'calc-lib'
import { Border } from './parts/border'
import VERT_MAIN from '../shader/main.vert'
import FRAG_MAIN from '../shader/main.frag'

export class App {
  private readonly LAYER_MAIN = 0
  private readonly LAYER_BLOOM = 1

  private layerBloom: Layers
  private darkMaterial: MeshBasicMaterial
  private materials: { [key: string]: Material | Material[] }

  private renderer: WebGLRenderer
  private bloomComposer: EffectComposer
  private mainComposer: EffectComposer

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
    this.renderer.toneMapping = ReinhardToneMapping

    this.layerBloom = new Layers()
    this.layerBloom.set(this.LAYER_BLOOM)
    this.darkMaterial = new MeshBasicMaterial({ color: 0x000000 })
    this.materials = {}

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

    // setup lights
    const ambient = new AmbientLight(0x404040)
    this.scene.add(ambient)

    const renderScene = new RenderPass(this.scene, this.camera)

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
    this.bloomComposer.addPass(renderScene)
    this.bloomComposer.addPass(bloomPass)

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
    this.mainComposer.addPass(renderScene)
    this.mainComposer.addPass(mainPass)

    // setup object
    this.scene.traverse(this.disposeMaterial.bind(this))

    this.border = new Border()
    this.border.layers.enable(this.LAYER_BLOOM)
    this.scene.add(this.border)

    const color = new Color()
    color.setHSL(0.5, 0.7, 0.2 + 0.05)
    const mesh = new Mesh(
      new SphereGeometry(100),
      new MeshBasicMaterial({ color })
    )
    this.scene.add(mesh)

    // animation

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
    const bloomParam = this.pane.addFolder({ title: 'Bloom' })
    bloomParam.addInput(bloomPass, 'strength', { min: 0.0, max: 10.0 })
    bloomParam.addInput(bloomPass, 'radius', { min: 0.0, max: 1.0, step: 0.01 })
    bloomParam.addInput(bloomPass, 'threshold', {
      min: 0.0,
      max: 1.0,
      step: 0.01
    })
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

    this.bloomComposer.setSize(w, h)
    this.mainComposer.setSize(w, h)
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
    this.scene.traverse(this.darkenNonBloomed.bind(this))
    this.bloomComposer.render()
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
    if (obj.isMesh && !this.layerBloom.test(obj.layers)) {
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
