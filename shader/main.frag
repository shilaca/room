precision mediump float;

uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(texture2D(baseTexture, vUv) + vec4(vec3(1.0), .0) * texture2D(bloomTexture, vUv));
}