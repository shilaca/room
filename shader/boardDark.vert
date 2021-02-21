precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 color;
attribute vec3 displacement;
attribute vec2 uv;

varying vec2 vUv;
varying vec3 vColor;

vec3 toColorP(vec3 v) {
  return v / 255.0;
}

void main() {
  vUv = uv;
  vColor = toColorP(vec3(56.0, 132.0, 224.0));
  vec3 vv = position + displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vv, 1.0);
}