import { Clock, Group, Texture } from 'three'
import { Board, FillMaterialUniforms } from './board'

interface BorderParts {
  floor: Board
  wallC: Board
  wallL: Board
  wallR: Board
  ceiling: Board
}

export class Border extends Group {
  private boards: Partial<BorderParts> = {}
  get floor(): Board {
    return this._get('floor')
  }
  set floor(v: Board) {
    this.boards.floor = v
  }
  get wallC(): Board {
    return this._get('wallC')
  }
  set wallC(v: Board) {
    this.boards.wallC = v
  }
  get wallL(): Board {
    return this._get('wallL')
  }
  set wallL(v: Board) {
    this.boards.wallL = v
  }
  get wallR(): Board {
    return this._get('wallR')
  }
  set wallR(v: Board) {
    this.boards.wallR = v
  }
  get ceiling(): Board {
    return this._get('ceiling')
  }
  set ceiling(v: Board) {
    this.boards.ceiling = v
  }

  wire: Group
  fill: Group

  static APPEARANCE_TIME = 2.4
  static DISAPPEARANCE_TIME = 2.4
  private state: 'invisible' | 'in' | 'visible' | 'out'
  clock: Clock

  constructor(textures: {
    floor: Texture
    ceiling: Texture
    wallC: Texture
    wallL: Texture
    wallR: Texture
  }) {
    super()

    this.wire = new Group()
    this.fill = new Group()

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

    this.state = 'invisible'
    this.clock = new Clock(false)
  }

  switch(show: 'wire' | 'fill' | 'all'): void {
    for (const [k, v] of Object.entries(this.boards)) {
      if (!v) continue
      v.verWires.visible = false
      v.horWires.visible = false
      v.fill.visible = false
      switch (show) {
        case 'wire':
          v.verWires.visible = true
          v.horWires.visible = true
          break
        case 'fill':
          v.fill.visible = true
          break
        case 'all':
        default:
          v.verWires.visible = true
          v.horWires.visible = true
          v.fill.visible = true
          break
      }
    }
  }

  update(): void {
    for (const [k, v] of Object.entries(this.boards)) {
      v?.updateUniforms(this.getCurrentUniform())
    }
  }

  appear(): void {
    this.state = 'in'
    this.clock.start()
  }

  disappear(): void {
    this.state = 'out'
    this.clock.start()
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

  private getCurrentUniform(): Partial<FillMaterialUniforms> {
    let u_time = 0
    let u_endTime = 0
    switch (this.state) {

      case 'in':
        u_time = this.clock.getElapsedTime()
        u_endTime = Border.APPEARANCE_TIME
        if (u_time >= u_endTime) {
          this.clock.stop()
          this.state = 'visible'
          u_time = u_endTime
        }
        break

      case 'out':
        u_endTime = Border.DISAPPEARANCE_TIME
        u_time = u_endTime - this.clock.getElapsedTime()
        if (u_time <= 0) {
          this.clock.stop()
          this.state = 'invisible'
          u_time = 0
        }
        break;

      case 'visible':
        u_time = 1
        u_endTime = 1
        break

      case 'invisible':
      default:
        u_time = 0
        u_endTime = -1
        break

    }
    return { u_time, u_endTime }
  }

  private _get(key: keyof BorderParts): Board {
    const board = this.boards[key]
    if (board) return board
    else throw new ReferenceError('Error occurred in Boarder')
  }
}
