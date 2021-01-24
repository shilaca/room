precision mediump float;

varying vec2 vUv;
varying vec3 vColor;

uniform float u_time;
uniform float u_endTime;
uniform int u_direction;
uniform sampler2D u_main_texture;


void main() {
    vec2 uv = vUv;
    vec3 color = texture2D(u_main_texture, uv).rgb;
    gl_FragColor = vec4(color, 1.0);
}
