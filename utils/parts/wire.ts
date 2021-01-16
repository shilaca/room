import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  LineBasicMaterial,
  LineSegments,
  Object3D
} from 'three'

export class Wire extends Object3D {
  constructor(points: number[], divisions: number, color = 0x3884e0) {
    const _needed = (divisions + 1) * 3
    if (points.length < _needed)
      throw new Error(`Not enough points. (${points.length} < ${_needed})`)

    super()

    for (let i = 0; i < divisions; i++) {
      const _points = Float32Array.from(points.slice(i * 3, (i + 2) * 3))
      const geo = new BufferGeometry()
      geo.setAttribute(
        'position',
        new BufferAttribute(_points, 3).setUsage(DynamicDrawUsage)
      )
      const mat = new LineBasicMaterial({
        color
      })
      const line = new LineSegments(geo, mat)
      super.add(line)
    }
  }
}
