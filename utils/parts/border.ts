import { Clock, Group, Texture } from 'three'
import { Board } from './board'

export class Border extends Group {
  floor: Board
  wallC: Board
  wallL: Board
  wallR: Board
  ceiling: Board

  private state: 'appear' | 'in' | 'out' | 'idle'
  private clock: Clock

  constructor(textures: {
    floor: Texture
    ceiling: Texture
    wallC: Texture
    wallL: Texture
    wallR: Texture
  }) {
    super()

    this.floor = new Board(4, textures.floor)
    this.floor.rotateX(-Math.PI / 2)
    this.add(this.floor)

    this.ceiling = new Board(3, textures.ceiling)
    this.ceiling.position.set(0, 1, 0)
    this.ceiling.rotateX(Math.PI / 2)
    this.add(this.ceiling)

    this.wallC = new Board(1, textures.wallC)
    this.wallC.position.set(0, 0.5, -0.5)
    this.add(this.wallC)

    this.wallL = new Board(5, textures.wallL)
    this.wallL.rotateY(Math.PI / 2)
    this.wallL.position.set(-0.5, 0.5, 0)
    this.add(this.wallL)

    this.wallR = new Board(2, textures.wallR)
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
