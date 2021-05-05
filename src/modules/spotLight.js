import * as THREE from 'three'

/**
 * Spotlight for the animated d20 dice
 */
export default class SpotLight {
    constructor(scene, target) {
        this._scene = scene
        this._target = target
        this.light = new THREE.SpotLight(0xffffff, 50, 2, Math.PI * 0.1, 0.25, 4.7)          
    }

    init() {
        this.light.position.set(0, 1, - 1.7)
        this.light.castShadow = true;
        this.light.target = this._target
        this.light.shadow.radius = 10
        this.light.shadow.mapSize.width = 1024
        this.light.shadow.mapSize.height = 1024
        this.light.shadow.camera.near = 0.1
        this.light.shadow.camera.far = 1.5
        this.light.shadow.camera.fov = 30

        this._scene.add(this.light)
        this._scene.add(this.light.target)
    }

    helper() {
        const lightHelper = new THREE.SpotLightHelper(this.light)

        this._scene.add(lightHelper)
        window.requestAnimationFrame(() => {
            lightHelper.update()
        })
    }

    directionalLightCameraHelper() {
        const helper = new THREE.CameraHelper(this.light.shadow.camera)
        this._scene.add(helper)
    }
}
