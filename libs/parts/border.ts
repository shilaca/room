import { Clock, Group, Texture } from 'three'
import { Board, FillMaterialUniforms } from './board'
import BezierEasing from 'bezier-easing'

interface BorderParts {
  floor: Board
  wallC: Board
  wallL: Board
  wallR: Board
  ceiling: Board
}

type AlpayBoardsFunc = (k: keyof BorderParts, v: Board) => void

export class Border extends Group {
  static appearBezire = BezierEasing(0.16, 0.35, 0.34, 0.87)

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

  static APPEARANCE_TIME = 1.2
  static DISAPPEARANCE_TIME = 1.2
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
    const func: AlpayBoardsFunc = (_, v) =>
      v.updateUniforms(this.getCurrentUniform())
    this._aplayBoards(func)
  }

  appear(): void {
    this.state = 'in'
    this.clock.start()
  }

  disappear(): void {
    this.state = 'out'
    this.clock.start()
  }

  changeMaterial(kind: 'default' | 'dark'): void {
    const func: AlpayBoardsFunc = (_, v) => v.changeMaterial(kind)
    this._aplayBoards(func)
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
    let time = 0
    let endTime = 0
    let u_rate = 0
    switch (this.state) {
      case 'in':
        time = this.clock.getElapsedTime()
        endTime = Border.APPEARANCE_TIME
        if (time >= endTime) {
          this.clock.stop()
          this.state = 'visible'
          u_rate = 1
        } else {
          u_rate = 1 - (endTime - time)
        }
        break

      case 'out':
        endTime = Border.DISAPPEARANCE_TIME
        time = endTime - this.clock.getElapsedTime()
        if (time <= 0) {
          this.clock.stop()
          this.state = 'invisible'
          u_rate = 0
        } else {
          u_rate = 1 - (endTime - time)
        }
        break

      case 'visible':
        u_rate = 1
        break

      case 'invisible':
      default:
        u_rate = 0
        break
    }
    u_rate = Border.appearBezire(u_rate)
    return { u_rate }
  }

  private _get(key: keyof BorderParts): Board {
    const board = this.boards[key]
    if (board) return board
    else throw new ReferenceError('Error occurred in Boarder')
  }

  private _aplayBoards(func: AlpayBoardsFunc): void {
    for (const [k, v] of Object.entries(this.boards)) {
      if (v) func(k as keyof BorderParts, v)
    }
  }
}
