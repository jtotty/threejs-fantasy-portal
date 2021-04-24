import * as THREE from 'three'
import { gsap } from 'gsap'
import numbersVertexShader from '../shaders/numbers/vertex.glsl'
import numbersFragmentShader from '../shaders/numbers/fragment.glsl'

export default class DiceNumber {
    /**
     * Create our dice number
     * @param {JSON} font 
     * @param {String} text 
     * @param {THREE.Scene} scene 
     * @param {String} startColor 
     * @param {String} endColor 
     */
    constructor(font, text, scene, startColor, endColor) {
        this._scene = scene
        this._font = font
        this.diceNumber = null
        this.geometry = this.createTextGeometry(text, this._font)

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uAlpha: { value: 1 },
                uDistance: { value: -2 },
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
        this.diceNumber.position.set(0, 0.9, -1.8)
        this._scene.add(this.diceNumber)
    }

    /**
     * Animate shader material
     * @param {Number} delta 
     */
    animateShader(delta) {
        this.material.uniforms.uTime.value = delta
    }

    /**
     * Create the THREE TextGeometry
     * @param {String} text 
     * @param {JSON} font 
     * @returns {THREE.TextGeometry}
     */
    createTextGeometry(text, font) {
        text = (typeof text === 'number') ? text.toString() : text;

        return new THREE.TextGeometry(
            text,
            {
                font,
                size: 0.5,
                height: 0.01,
                curveSegments: 124,
                bevelEnabled: false
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

    destroy() {
        if (this.diceNumber != null) {
            this.geometry.dispose()
            this.material.dispose()
            this._scene.remove(this.diceNumber)
        }
    }

    fadeIn() {
        const distance = { value: -2 }
        gsap.to(distance, {
            duration: 2,
            value: 1.4,
            ease: 'sine.in',
            onUpdate: () => {
                this.material.uniforms.uDistance.value = distance.value
            }
        })
    }

    fadeOut() {
        return new Promise(resolve => {
            const distance = { value: 1.4 }
            gsap.to(distance, {
                duration: 2,
                value: -2,
                ease: 'sine.in',
                onUpdate: () => {
                    this.material.uniforms.uDistance.value = distance.value
                },
                onComplete: () => {
                    this.destroy()
                    resolve()
                }
            })
        })
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
