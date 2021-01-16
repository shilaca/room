precision mediump float;

varying vec3 vColor;

uniform float u_time;
uniform float u_endTime;
uniform int u_direction;


void main(){

    gl_FragColor = vec4(vColor, 1.0);
}
