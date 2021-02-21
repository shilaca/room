precision mediump float;

varying vec2 vUv;
varying vec3 vColor;

uniform float u_time;
uniform float u_endTime;
uniform int u_direction;
uniform sampler2D u_main_texture;

// 2D Random
float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = smoothstep(1., 1., f);

    return mix(a, b, u.x) + (c - a) * u.y * (1. - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = vUv;
    float rate = u_time <= u_endTime ? 1.0 - (u_endTime - u_time) : 0.0;

    vec2 pos = vec2(uv * 8.);

    vec3 color = vec3(0.);
    float t = .4;
    float alpha = rate == 0. ? 0. : noise(pos) + rate;
    alpha = alpha * random(vec2(rate)) * t + (1.0 - t) * rate;

    gl_FragColor = vec4(color, alpha);
}
