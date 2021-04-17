import * as THREE from 'three'

/**
 * Loading Screen
 */
export default class LoadingScreen {
    constructor(scene) {
        this._scene = scene

        this.overlay = null
        this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
        this.material = new THREE.ShaderMaterial({
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

        this.loadingBarElement = document.querySelector('.loading-squares')
    }

    /**
     * Material alpha value
     * 
     * @returns {Number}
     */
    get uAlpha() {
        return this.material.uniforms.uAlpha
    }

    init() {
        this.overlay = new THREE.Mesh(this.geometry, this.material)
        this._scene.add(this.overlay)
    }

    loaded() {
        this.loadingBarElement.classList.add('ended')
        this.loadingBarElement.style.transform = ''
    }
}
