import { IUniform } from 'three'

////// for threejs utils

export type FormatUniforms<T> = {
  [P in keyof T]: { value: T[P] }
}

type Uniforms = { [uniform: string]: IUniform }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatUniforms(obj: { [key: string]: any }): Uniforms {
  const formated: Uniforms = {}
  for (const [key, value] of Object.entries(obj)) {
    formated[key] = { value }
  }
  return formated
}
