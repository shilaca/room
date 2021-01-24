import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneBufferGeometry,
  Points,
  PointsMaterial,
  RawShaderMaterial,
  Texture
} from 'three'
import { App } from '../app'
import { Wire } from './wire'
import VERT_FILL from '../../shader/boardFill.vert'
import FRAG_FILL from '../../shader/boardFill.frag'

/**
 * used in border
 *
 * stroke material uniforms
 * {
 *  u_time:       [float; ms] 時間経過 アニメーションの開始は 0ms から始まる
 *  u_endTime:    [float; ms] アニメーションの終了時間
 *  u_direction:  [int]       位置
 *        -----
 *        | 3 |
 *    -------------
 *    | 5 | 1 | 2 |
 *    -------------
 *        | 4 |
 *        -----
 * }
 */
export class Board extends Group {
  private readonly WS: number = 6
  private readonly HS: number = 6

  private geo: PlaneBufferGeometry

  private particles: BufferGeometry
  private points_mat: PointsMaterial
  private points: Points

  verWires: Group
  horWires: Group

  private fill_mat: Material
  private fill: Mesh

  constructor(private direction: 1 | 2 | 3 | 4 | 5, private texture: Texture) {
    super()

    this.geo = new PlaneBufferGeometry(1, 1, this.WS, this.HS)

    const particlesPos = this.geo.attributes.position.array
    this.particles = new BufferGeometry()
    this.particles.setAttribute(
      'position',
      new BufferAttribute(particlesPos, 3).setUsage(DynamicDrawUsage)
    )
    this.points_mat = new PointsMaterial({
      color: 0x3884e0,
      size: 4
    })
    this.points = new Points(this.particles, this.points_mat)
    this.add(this.points)

    const _w = this.WS + 1
    const _h = this.HS
    this.verWires = new Group()
    this.horWires = new Group()
    for (let i = 0; i < _w; i++) {
      const size = 3
      const convert = (p: number): number[] =>
        new Array(size)
          .fill(0)
          .map((_, idx) => idx)
          .map(x => particlesPos[p + x])
      const startV = i * size
      const startH = _w * size * i
      let pointsV = convert(startV)
      let pointsH = convert(startH)
      let j = 1
      // eslint-disable-next-line no-constant-condition
      while (1) {
        if (_h >= j) pointsV = pointsV.concat(convert(_w * size * j + startV))
        if (_w - 1 >= j) pointsH = pointsH.concat(convert(startH + j * 3))
        else break
        j++
      }
      this.verWires.add(new Wire(pointsV, this.WS))
      this.horWires.add(new Wire(pointsH, this.HS, 0xff84e0))
    }
    this.verWires.layers.enable(App.LAYER_BLOOM)
    this.horWires.layers.enable(App.LAYER_BLOOM)
    this.add(this.verWires)
    this.add(this.horWires)

    // this.texture.needsUpdate = true
    // this.fill_mat = new MeshBasicMaterial({
    //   color: 0xfd5937,
    //   transparent: true,
    //   opacity: 1,
    //   map: this.texture
    // })
    this.fill_mat = new RawShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_endTime: { value: 0 },
        u_direction: { value: this.direction },
        u_main_texture: { value: this.texture }
      },
      vertexShader: VERT_FILL,
      fragmentShader: FRAG_FILL,
      side: DoubleSide
    })
    this.fill = new Mesh(this.geo, this.fill_mat)
    this.fill.position.setZ(0.01)
    // this.fill.visible = false
    this.add(this.fill)
  }
}
