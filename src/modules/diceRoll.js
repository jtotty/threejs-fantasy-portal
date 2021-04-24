import { gsap } from 'gsap'

export default class DiceRoll {
    /**
     * @param {Object} model Dice Model
     */
    constructor(model) {
        this.diceModel = model
        this.animating = false
        this.faces = [
            { value:  1, euler: { x: 0,      y: 0,       z: 0       } },
            { value:  2, euler: { x: 0.77,   y: 3.215,   z: 4.165   } },
            { value:  3, euler: { x: 1.103,  y: -0.617,  z: 0.054   } },
            { value:  4, euler: { x: 4.225,  y: 0.633,   z: -0.079  } },
            { value:  5, euler: { x: 1.35,   y: 0.699,   z: -2.313  } },
            { value:  6, euler: { x: 1.296,  y: -2.621,  z: 1.21    } },
            { value:  7, euler: { x: 0.77,   y: 0.099,   z: -1.052  } },
            { value:  8, euler: { x: 0.957,  y: 3.146,   z: 0       } },
            { value:  9, euler: { x: 1.206,  y: 0.516,   z: 1.945   } },
            { value: 10, euler: { x: 1.175,  y: 3.841,   z: -0.859  } },
            { value: 11, euler: { x: -1.911, y: -2.444,  z: -0.854  } },
            { value: 12, euler: { x: 1.163,  y: 2.623,   z: -1.208  } },
            { value: 13, euler: { x: 0.911,  y: 0,       z: 3.138   } },
            { value: 14, euler: { x: 0.668,  y: 3.048,   z: 2.097   } },
            { value: 15, euler: { x: 1.236,  y: -0.518,  z: -1.94   } },
            { value: 16, euler: { x: 1.241,  y: 2.446,   z: 0.867   } },
            { value: 17, euler: { x: 1.054,  y: 0.632,   z: -0.065  } },
            { value: 18, euler: { x: 1.045,  y: 3.769,   z: 3.217   } },
            { value: 19, euler: { x: 0.704,  y: -0.091,  z: 1.07    } },
            { value: 20, euler: { x: 0,      y: 3.14159, z: 3.14159 } }
        ]

        // this.valueElement = document.querySelector('.dice-value')
    }

    /**
     * Roll animation and stop on random number between 1 - 20
     * @returns {Promise} Promise object represents the rolled value
     */
    roll() {
        return new Promise(resolve => {
            const value = Math.floor(Math.random() * 20 + 1)
            const face = this.faces.find(face => face.value === value)

            gsap.to(this.diceModel.rotation, {
                keyframes: [
                    {
                        duration: 1,
                        x: 'random(0, 50)',
                        y: 'random(0, 50)'
                    },
                    {
                        duration: 1,
                        x: face.euler.x,
                        y: face.euler.y,
                        z: face.euler.z
                    }
                ],
                ease: 'sine.inOut',
                onStart: () => {
                    this.animating = true
                },
                onComplete: () => {
                    // this.valueElement.innerHTML = value
                    resolve(value)
                }
            })
        })
    }
}
