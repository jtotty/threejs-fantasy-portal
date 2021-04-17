import * as THREE from 'three'
import { gsap } from 'gsap'

export default class DiceRoll {
    constructor(model) {
        this.diceModel = model
        this.piRadians = Math.PI / 180
        this.fullRotation = 360 * this.piRadians
        this.animating = false
    }

    roll() {
        gsap.to(this.diceModel.rotation, {
            duration: 'random(2.0, 4.0)',
            x: 'random(-100, 100, 1)',
            y: 'random(-100, 100, 1)',
            ease: 'sine.inOut',
            onStart: () => {
                this.animating = true
            },
            onComplete: () => {
                const qauternion = new THREE.Quaternion().setFromEuler(this.diceModel.rotation)
                const test = {
                    x: - Math.round(qauternion.x * 100000) / 100000,
                    y: - Math.round(qauternion.y * 100000) / 100000,
                    z: - Math.round(qauternion.z * 100000) / 100000,
                }

                this.animating = false
                console.log(test)
            }
        })
    }
}
