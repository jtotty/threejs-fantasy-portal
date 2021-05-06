import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Animation
import { gsap } from 'gsap'

// Custom modules
import LoadingScreen from './modules/loadingScreen.js'
import Particles from './modules/particles.js'
import DiceRoll from './modules/diceRoll.js'
import DiceNumber from './modules/diceNumber.js'
import SpotLight from './modules/spotLight.js'

// FPS Counter
import Stats from 'stats.js'

// Shaders
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom )

if (process.env.PRODUCTION) {
    gui.hide()
    stats.dom.classList.add('hide')
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loading Screen
const loadingScreen = new LoadingScreen(scene)
loadingScreen.init()
 
// Axis Helper
if (!process.env.PRODUCTION) {
    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)
}

/**
 * Loaders
 */
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        onLoaded()
        gsap.delayedCall(0.5, () => {
            gsap.to(loadingScreen.uAlpha, { duration: 2, value: 0, ease: 'power2.in' })
            loadingScreen.loaded()
            particles.init()
        })
    }
)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader(loadingManager)

const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const d20Texture = textureLoader.load('d20.jpg')
d20Texture.flipY = false
d20Texture.encoding = THREE.sRGBEncoding

/**
 * Model Loaders
 */
// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Materials
 */
// Baked material
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// Lamp light material
const lampLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffb8 })

// d20 material
const d20Material = new THREE.MeshToonMaterial({ map: d20Texture })

debugObject.distance = 1.4
debugObject.portalColorStart = '#a3c5e1'
debugObject.portalColorEnd = '#ffffff'

gui
    .add(debugObject, 'distance').min(-1).max(10).step(0.1)
    .onChange(() => {
        portalLightMaterial.uniforms.uDistance.value = debugObject.distance
    })

gui
    .addColor(debugObject, 'portalColorStart')
    .onChange(() => {
        portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
    })

gui
    .addColor(debugObject, 'portalColorEnd')
    .onChange(() => {
        portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
    })

// Portal light material
const portalLightMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uAlpha: { value: 1 },
        uDistance: { value : 1.4 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})

/**
 * Main scene
 */
let mainModel
gltfLoader.load(
    'portal.glb',
    gltf => {
        console.log(gltf.scene.children)
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const lampLightAMesh = gltf.scene.children.find(child => child.name === 'lampLightA')
        const lampLightBMesh = gltf.scene.children.find(child => child.name === 'lampLightB')
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')
        const staffOrbMesh = gltf.scene.children.find(child => child.name === 'staffOrb')

        bakedMesh.material = bakedMaterial
        bakedMesh.castShadow = true

        lampLightAMesh.material = lampLightMaterial
        lampLightBMesh.material = lampLightMaterial
        portalLightMesh.material = portalLightMaterial
        staffOrbMesh.material = lampLightMaterial

        mainModel = gltf.scene
        scene.add(mainModel)
    }
)

/**
 * d20 Dice
 */
let d20Model
let diceRoll
gltfLoader.load(
    'd20.glb',
    gltf => {
        d20Model = gltf.scene.children.find(child => child.name === 'd20')
        d20Model.scale.set(0.06, 0.06, 0.06)
        d20Model.position.set(0, 2.1, - 1.8)
        d20Model.material = d20Material
        d20Model.receiveShadow = true
        d20Model.castShadow = true
        scene.add(d20Model)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
        scene.add(ambientLight)

        const spotLight = new SpotLight(scene, d20Model)
        spotLight.init()

        if (!process.env.PRODUCTION) {
            spotLight.helper()
            spotLight.directionalLightCameraHelper()
        }

        // Dice roll button
        diceRoll = new DiceRoll(d20Model)
    }
)

/**
 * Particles
 */
const particles = new Particles(scene)

gui.add(particles.props, 'size').min(0).max(100).step(1).onFinishChange(value => {
    particles.updateProps('size', value)
})
gui.add(particles.props, 'count').min(0).max(10000).step(10).onFinishChange(value => {
    particles.updateProps('count', value)
})
gui.addColor(particles.props, 'insideColor').onFinishChange(value => {
    particles.updateProps('insideColor', value)
})
gui.addColor(particles.props, 'outsideColor').onFinishChange(value => {
    particles.updateProps('outsideColor', value)
})

/**
 * Fonts
 */
let diceText = ''
let diceNumber
const fontLoader = new THREE.FontLoader()
fontLoader.load(
    '/fonts/Fredoka_One_Regular.json',
    font => {
        diceNumber = new DiceNumber(font, diceText, scene)
        diceNumber.init()
    }
)

/**
 * Animate portal shader colours to allow number to appear in center
 */
const portalShrink = value => {
    gsap.to(debugObject, {
        duration: 1,
        distance: -1,
        ease: 'sine.in',
        onUpdate: () => {
            portalLightMaterial.uniforms.uDistance.value = debugObject.distance
        },
        onComplete: () => {
            diceNumber.updateNumber(value)
            
            gsap.to(debugObject, {
                duration: 1,
                distance: 1.5,
                ease: 'sine.in',
                onUpdate: () => {
                    portalLightMaterial.uniforms.uDistance.value = debugObject.distance
                },
                onComplete: () => {
                    diceRoll.animating = false
                }
            })
        }
    })
}

let nat20Gsap = null
const nat20 = () => {
    const rainbow = {
        'red': '#fc6f6f',
        'orange': '#fca96f',
        'yellow': '#e6db5f',
        'green': '#95e65d',
        'purple': '#8d5de6',
        'violet': '#cd5de6',
        'blue': '#a3c5e1'
    }

    const portalKeyframes = []
    for (const key of Object.keys(rainbow)) {
        portalKeyframes.push({
            duration: 0.618,
            portalColorStart: rainbow[key]
        })
    }

    nat20Gsap = gsap.to(debugObject, {
        keyframes: portalKeyframes,
        delay: 1,
        repeat: -1,
        ease: 'sine.inOut',
        onUpdate: () => {
            portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
        },
    })

    gsap.to(particles.props, {
        duration: 3,
        frequency: 100,
        delay: 1,
        ease: 'sine.inOut',
        onUpdate: () => {
            particles.updateUniform('uFrequency', particles.props.frequency)
        }
    })
}

const setPortalColor = (color, value) => {
    if (nat20Gsap != null) nat20Gsap.kill()    

    gsap.to(debugObject, {
        portalColorStart: color,
        delay: 1,
        ease: 'sine.inOut',
        onUpdate: () => {
            portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
        },
    })

    gsap.to(particles.props, {
        duration: 1,
        frequency: value / 2,
        delay: 1,
        ease: 'sine.inOut',
        onUpdate: () => {
            particles.updateUniform('uFrequency', particles.props.frequency)
        }
    })
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const onLoaded = () => {
    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Update particles
        particles.updateSizes()
        gui.updateDisplay()
    })

    const button = document.querySelector('.btn')
    button.classList.add('show')

    button.addEventListener('click', () => {
        if (!diceRoll.animating) {
            diceRoll.roll().then(value => {
                portalShrink(value)

                switch (value) {
                    case 1:
                        setPortalColor('#616161', value)
                        break

                    case 20:
                        nat20()
                        break

                    default:
                        setPortalColor('#a3c5e1', value)
                        break
                }
            })
        }
    })
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 50)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true

debugObject.clearColor = '#353543'
renderer.setClearColor(debugObject.clearColor)
gui
    .addColor(debugObject, 'clearColor')
    .onChange(() => {
        renderer.setClearColor(debugObject.clearColor)
    })

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    const delta = clock.getElapsedTime()

    stats.begin()

    // Update fireflies
    particles.animate(delta)

    // Update portal
    portalLightMaterial.uniforms.uTime.value = delta

    // Float Dice
    if (d20Model != null) {
        d20Model.position.y += Math.sin(delta * 2) * 0.0005
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    stats.end()

}

tick()
