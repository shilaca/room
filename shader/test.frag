precision mediump float;

uniform float step;
varying vec3 vColor;

void main(){
    float r = vColor.r + cos(50.0);
    float g = vColor.g + cos(60.0);
    float b = vColor.b + cos(70.0);
    gl_FragColor = vec4(r,g,b,1.0);
}
