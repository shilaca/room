import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Points,
  PointsMaterial
} from 'three'
import { Wire } from './wire'

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

  private verWires: Group
  private horWires: Group

  private fill_mat: MeshBasicMaterial
  private fill: Mesh

  constructor() {
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
    this.add(this.verWires)
    this.add(this.horWires)

    this.fill_mat = new MeshBasicMaterial({
      transparent: true,
      opacity: 0
    })
    this.fill = new Mesh(this.geo, this.fill_mat)
    this.fill.position.setZ(0.01)
    this.fill.visible = false
    this.add(this.fill)
  }
}
