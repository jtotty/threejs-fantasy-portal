import * as THREE from 'three'

/**
 * Loading Screen
 */
export default class LoadingScreen {
    constructor() {
        this.overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)

        this.overlayMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uAlpha: { value: 1 }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uAlpha;
    
                void main() {
                    gl_FragColor = vec4(0.208, 0.208, 0.263, uAlpha);
                }
            `,
            transparent: true,
            depthWrite: false
        })

        this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial)

        this.loadingBarElement = document.querySelector('.loading-squares')
    }


    get uAlpha() {
        return this.overlayMaterial.uniforms.uAlpha
    }

    loaded() {
        this.loadingBarElement.classList.add('ended')
        this.loadingBarElement.style.transform = ''
    }
}
