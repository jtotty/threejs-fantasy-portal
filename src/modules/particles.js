import * as THREE from 'three'
import firefliesVertexShader from '../shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from '../shaders/fireflies/fragment.glsl'

export default class Particles {
    /**
     * Create our Particles.
     */
    constructor(scene) {
        this._scene = scene

        this.props = {
            count: 5000,
            size: Math.floor(70 * (window.innerHeight / 1440)),
            insideColor: '#ffffff',
            outsideColor: '#0f3dac'
        }

        this.points = null
        this.geometry = new THREE.BufferGeometry()
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uSize: { value: this.props.size }
            },
            vertexColors: true,
            vertexShader: firefliesVertexShader,
            fragmentShader: firefliesFragmentShader,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    }

    /**
     * Create our points.
     *
     * @returns THREE.Points
     */
    init() {
        const positionArray = new Float32Array(this.props.count * 3)
        const colorsArray = new Float32Array(this.props.count * 3)
        const scaleArray = new Float32Array(this.props.count)
        
        const insideColor = new THREE.Color(this.props.insideColor)
        const outsideColor = new THREE.Color(this.props.outsideColor)

        for (let i = 0; i < this.props.count; i++) {
            const i3 = i * 3
            positionArray[i3 + 0] = (Math.random() - 0.5) * 4
            positionArray[i3 + 1] = 1
            positionArray[i3 + 2] = (Math.random() - 0.5) * 4
    
            scaleArray[i] = Math.random()
    
            // Color
            const radius = Math.random() * 2
            const mixedColor = insideColor.clone()
            mixedColor.lerp(outsideColor, radius / 2)
    
            colorsArray[i3    ] = mixedColor.r
            colorsArray[i3 + 1] = mixedColor.g
            colorsArray[i3 + 2] = mixedColor.b
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
        this.geometry.setAttribute('aScale', new THREE.BufferAttribute(positionArray, 1))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))

        this.points = new THREE.Points(this.geometry, this.material)

        this._scene.add(this.points)
    }

    /**
     * Reset our particles
     */
    reset() {
        if (this.points != null) {
            this.geometry.dispose()
            this.material.dispose()
            this._scene.remove(this.points)

            this.init()
        }
    }

    /**
     * Update properties.
     * 
     * @param {String} prop
     * @param {Number} value
     */
    updateProps(key, value) {
        this.props[key] = value

        if (key === 'size') {
            this.material.uniforms.uSize.value = this.props.size
        } else {
            this.reset()
        }
    }

    /**
     * Animate our particles.
     *
     * @param {Number} elapsedTime 
     */
    animate(elapsedTime) {
        if (this.points != null) {
            this.material.uniforms.uTime.value = elapsedTime
        }
    }

    /**
     * Update the material pixel ratio and the particle sizes.
     */
    updateSizes() {
        this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
        this.material.uniforms.uSize.value = Math.floor(70 * (window.innerHeight / 1440))
        this.props.size = this.material.uniforms.uSize.value
    }
}
