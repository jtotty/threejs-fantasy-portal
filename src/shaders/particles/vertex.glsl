uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;

varying vec3 vColor;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Animate point positions
    modelPosition.z -= tan(uTime + modelPosition.x) * 0.05;

    if (modelPosition.z < - 1.8 || modelPosition.z > 2.0) {
        modelPosition.z = 10.0;
    }

    float attractToCenter = log(modelPosition.z + 3.0);
    float yWave = sin(modelPosition.z * 2.0) * aScale * 0.3;
    
    if (modelPosition.x > 0.0) {
        modelPosition.x = attractToCenter;
        modelPosition.y += yWave;
    } else {
        modelPosition.x = 0.0 - attractToCenter;
        modelPosition.y -= yWave;
    }

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    
    gl_PointSize = uSize * aScale * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z); // Size attenuation

    // Color
    vColor = color;
}