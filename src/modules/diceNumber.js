import * as THREE from 'three'

export default class DiceNumber {
    /**
     * Create our dice number
     * @param {JSON} font 
     * @param {String} text 
     * @param {THREE.Scene} scene 
     */
    constructor(font, text, scene) {
        this._scene = scene
        this._font = font
        this.diceNumber = null
        this.geometry = this.createTextGeometry(text, this._font)
        this.material = new THREE.MeshBasicMaterial({ color: '#ffffff' })
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
     * @param {String} text 
     */
    updateNumber(text) {
        this.destroy()
        this.geometry = this.createTextGeometry(text, this._font)
        this.init()
    }

    /**
     * Remove number
     */
    destroy() {
        if (this.diceNumber != null) {
            this.geometry.dispose()
            this.material.dispose()
            this._scene.remove(this.diceNumber)
        }
    }
}
