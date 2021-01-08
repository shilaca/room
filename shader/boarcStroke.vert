precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 color;
attribute vec3 displacement;
varying vec3 vColor;

void main(){
  vColor = color;
  vec3 vv = position + displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vv, 1.0);
}