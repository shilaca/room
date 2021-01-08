precision mediump float;

uniform float step;
varying vec3 vColor;

void main(){
    float r = vColor.r;
    float g = vColor.g;
    float b = vColor.b;
    gl_FragColor = vec4(r, g, b, 1.0);
}
