import * as THREE from 'three'
import numbersVertexShader from '../shaders/numbers/vertex.glsl'
import numbersFragmentShader from '../shaders/numbers/fragment.glsl'

export default class DiceNumber {
    constructor(font, text, scene, startColor, endColor) {
        this._scene = scene
        this._font = font
        this.diceNumber = null
        this.geometry = this.createTextGeometry(text, this._font)

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uAlpha: { value: 1 },
                uColorStart: { value: new THREE.Color(startColor) },
                uColorEnd: { value: new THREE.Color(endColor) }
            },
            vertexShader: numbersVertexShader,
            fragmentShader: numbersFragmentShader
        })
    }

    /**
     * Create the mesh and add to scene
     */
    init() {
        this.geometry.center()
        this.diceNumber = new THREE.Mesh(this.geometry, this.material)
        this.diceNumber.position.y = 1
        this._scene.add(this.diceNumber)
    }

    /**
     * Animate shader material
     *
     * @param {Number} delta 
     */
    animateShader(delta) {
        this.material.uniforms.uTime.value = delta
    }

    /**
     * Create the THREE TextGeometry
     * 
     * @param {String} text 
     * @param {JSON} font 
     * @returns THREE.TextGeometry
     */
    createTextGeometry(text, font) {
        if (typeof text === 'number') {
            text = text.toString()
        }

        return new THREE.TextGeometry(
            text,
            {
                font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 0.001,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
    }

    /**
     * Update the text displayed
     * 
     * @param {String} text 
     */
    updateNumber(text) {
        if (this.diceNumber != null) {
            this.geometry.dispose()
            this.material.dispose()
            this._scene.remove(this.diceNumber)
        }
        
        this.geometry = this.createTextGeometry(text, this._font)
        this.init()
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
