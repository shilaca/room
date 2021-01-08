import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Vector2
} from 'three'
import STROKE_VERT from '../../shader/boardStroke.vert'
import STROKE_FRAG from '../../shader/boardStroke.frag'

export class Board extends Group {
  private geo: PlaneBufferGeometry
  private fill_mat: MeshBasicMaterial
  private stroke_mat: RawShaderMaterial

  private fill: Mesh
  private stroke: Mesh

  constructor(color: number) {
    super()

    this.geo = new PlaneBufferGeometry(1, 1, 6, 6)
    // this.mat = new RawShaderMaterial({
    //   uniforms: {
    //     u_resolution: {
    //       value: new Vector2(1, 1)
    //     }
    //   },
    //   vertexShader: VERT_SHADER,
    //   fragmentShader: FRAG_SHADER
    // })
    this.fill_mat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0
    })
    this.fill = new Mesh(this.geo, this.fill_mat)
    this.fill.position.setZ(0.01)
    this.fill.visible = false

    this.stroke_mat = new RawShaderMaterial({
      wireframe: true,
      wireframeLinewidth: 4,
      uniforms: {
        resolution: {
          value: new Vector2(1, 1)
        }
      },
      vertexShader: STROKE_VERT,
      fragmentShader: STROKE_FRAG
    })
    this.stroke = new Mesh(this.geo, this.stroke_mat)

    this.add(this.fill)
    this.add(this.stroke)
  }
}
