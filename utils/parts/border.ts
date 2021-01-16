import { Clock, Group, RawShaderMaterial } from 'three'
import { Board } from './board'
import STROKE_VERT from '../../shader/boardStroke.vert'
import STROKE_FRAG from '../../shader/boardStroke.frag'

export class Border extends Group {
  private floor: Board
  private wallC: Board
  private wallL: Board
  private wallR: Board
  private ceiling: Board

  private state: 'appear' | 'in' | 'out' | 'idle'
  private clock: Clock

  constructor() {
    super()

    const strokeMat_common = new RawShaderMaterial({
      wireframe: true,
      wireframeLinewidth: 4,
      uniforms: {
        u_time: { value: 0 },
        u_endTime: { value: 1000 },
        u_direction: { value: 1 }
      },
      vertexShader: STROKE_VERT,
      fragmentShader: STROKE_FRAG
    })

    // const floorStrokeMat = strokeMat_common.clone()
    // floorStrokeMat.uniforms.u_direction.value = 4
    this.floor = new Board()
    this.floor.rotateX(-Math.PI / 2)
    this.add(this.floor)

    // const ceilingStrokeMat = strokeMat_common.clone()
    // ceilingStrokeMat.uniforms.u_direction.value = 3
    this.ceiling = new Board()
    this.ceiling.position.set(0, 1, 0)
    this.ceiling.rotateX(Math.PI / 2)
    this.add(this.ceiling)

    // const wallCStrokeMat = strokeMat_common.clone()
    // wallCStrokeMat.uniforms.u_direction.value = 1
    this.wallC = new Board()
    this.wallC.position.set(0, 0.5, -0.5)
    this.add(this.wallC)

    // const wallLStrokeMat = strokeMat_common.clone()
    // wallLStrokeMat.uniforms.u_direction.value = 5
    this.wallL = new Board()
    this.wallL.rotateY(Math.PI / 2)
    this.wallL.position.set(-0.5, 0.5, 0)
    this.add(this.wallL)

    // const wallRStrokeMat = strokeMat_common.clone()
    // wallRStrokeMat.uniforms.u_direction.value = 2
    this.wallR = new Board()
    this.wallR.rotateY(-Math.PI / 2)
    this.wallR.position.set(0.5, 0.5, 0)
    this.add(this.wallR)

    this.state = 'idle'
    this.clock = new Clock(false)
  }

  /**
   * room のリサイズ
   * @param n 何畳？
   */
  calcFloorSize(n = 6): void {
    // 畳サイズ (中京間) [cm]
    const tatami = {
      w: 182,
      h: 91,
      t: 60
    }
    switch (n) {
      case 6:
        this.scale.set(tatami.w * 2, 236, tatami.w + tatami.h)
        break

      default:
        console.warn('this floor size is undefined: ', n)
        break
    }
  }
}
