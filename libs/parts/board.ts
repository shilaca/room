import {
  BufferAttribute,
  BufferGeometry,
  FrontSide,
  DynamicDrawUsage,
  Group,
  Mesh,
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
import { FormatUniforms, formatUniforms } from '../utils'

export interface FillMaterialUniforms {
  u_time: number // [float; ms] 時間経過 アニメーションの開始は 0ms から始まる
  u_endTime: number // [float; ms] アニメーションの終了時間
  u_direction: number // [int] 位置 下のコメント参照
  /*        -----
   *        | 3 |
   *    -------------
   *    | 5 | 1 | 2 |
   *    -------------
   *        | 4 |
   *        -----
   */
  u_main_texture: Texture
}
type FillMaterialUniformsKey = keyof FillMaterialUniforms

/**
 * used in border
 */
export class Board extends Group {
  private readonly WS: number = 8
  private readonly HS: number = 8

  private geo: PlaneBufferGeometry

  private particles: BufferGeometry
  private points_mat: PointsMaterial
  private points: Points

  verWires: Group
  horWires: Group

  private fill_mat: RawShaderMaterial
  fill: Mesh

  constructor(private direction: 1 | 2 | 3 | 4 | 5, private texture: Texture) {
    super()

    // base geometry
    this.geo = new PlaneBufferGeometry(1, 1, this.WS, this.HS)

    // setup points
    const particlesPos = this.geo.attributes.position.array
    this.particles = new BufferGeometry()
    this.particles.setAttribute(
      'position',
      new BufferAttribute(particlesPos, 3).setUsage(DynamicDrawUsage)
    )
    this.points_mat = new PointsMaterial({
      color: 0x3884e0,
      size: 2
    })
    this.points = new Points(this.particles, this.points_mat)

    // setup wire
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

    // setup board
    const fillUniforms: FillMaterialUniforms = {
      u_time: 0.0,
      u_endTime: 3.0,
      u_direction: this.direction,
      u_main_texture: this.texture
    }
    this.fill_mat = new RawShaderMaterial({
      uniforms: formatUniforms(fillUniforms),
      vertexShader: VERT_FILL,
      fragmentShader: FRAG_FILL,
      side: FrontSide,
      transparent: true
      // opacity: 0.5
    })
    this.fill = new Mesh(this.geo, this.fill_mat)
    this.fill.position.setZ(0.001)

    // set layers
    this.verWires.layers.enable(App.LAYER_BLOOM)
    this.horWires.layers.enable(App.LAYER_BLOOM)
    this.fill.layers.enable(App.LAYER_BLOOM_ESC)

    // add
    this.add(this.fill)
    this.add(this.points)
    this.add(this.verWires)
    this.add(this.horWires)
  }

  updateUniforms(uniforms: Partial<FillMaterialUniforms>): void {
    for (const [k, v] of Object.entries(uniforms)) {
      const key = k as FillMaterialUniformsKey
      const val = v as FillMaterialUniforms[FillMaterialUniformsKey]
      const uni = this.fill_mat.uniforms as FormatUniforms<FillMaterialUniforms>
      uni[key].value = val
    }
  }
}
