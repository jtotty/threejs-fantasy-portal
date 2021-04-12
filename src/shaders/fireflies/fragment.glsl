varying vec3 vColor;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.05 * 2.0;

    gl_FragColor = vec4(vColor, strength);
}