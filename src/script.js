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
    // scene.add(axesHelper)
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
const d20Material = new THREE.MeshBasicMaterial({ map: d20Texture })

debugObject.portalColorStart = '#a3c5e1'
debugObject.portalColorEnd = '#ffffff'

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
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})

/**
 * Main scene
 */
let mainModel;
gltfLoader.load(
    'portal.glb',
    gltf => {
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const lampLightAMesh = gltf.scene.children.find(child => child.name === 'lampLightA')
        const lampLightBMesh = gltf.scene.children.find(child => child.name === 'lampLightB')
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')

        bakedMesh.material = bakedMaterial
        lampLightAMesh.material = lampLightMaterial
        lampLightBMesh.material = lampLightMaterial
        portalLightMesh.material = portalLightMaterial

        mainModel = gltf.scene
        scene.add(mainModel)
    }
)

/**
 * d20 Dice
 */
let d20Model
gltfLoader.load(
    'd20.glb',
    gltf => {
        d20Model = gltf.scene.children.find(child => child.name === 'd20')
        d20Model.scale.set(0.06, 0.06, 0.06)
        d20Model.position.set(0, 2.1, - 1.8)
        d20Model.material = d20Material
        scene.add(d20Model)
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
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let nat1 = false;
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

    // Dice roll button
    const diceRoll = new DiceRoll(d20Model)
    const button = document.querySelector('.btn')

    button.classList.add('show')
    button.addEventListener('click', () => {
        if (!diceRoll.animating) {
            diceRoll.roll().then(value => {
                console.log(mainModel.children)
                if (value === 1 && !nat1) {
                    mainModel.children.forEach(child => {
                        child.material.transparent = true

                        gsap.to(child.material, {
                            duration: 1,
                            opacity: 0,
                            ease: 'sine.in'
                        })

                        gsap.to(child.scale, {
                            duration: 1,
                            x: 0,
                            y: 0,
                            z: 0,
                            ease: 'sine.in'
                        })

                        gsap.to(child.position, {
                            duration: 1,
                            x: 0,
                            y: 0,
                            z: 0,
                            ease: 'sine.in'
                        })
                    })
    
                    gsap.to(portalLightMaterial.uniforms.uAlpha, {
                        duration: 1,
                        value: 0,
                        ease: 'sine.in'
                    })
    
                    particles.fade(1, 0)
    
                    gsap.to(debugObject, {
                        duration: 1,
                        clearColor: '#000000', 
                        ease: 'sine.in',
                        onUpdate() {
                            renderer.setClearColor(debugObject.clearColor)
                        },
                        onComplete() {
                            gui.updateDisplay()
                        }
                    })

                    nat1 = true
                }

                if (value !== 1 && nat1) {
                    mainModel.children.forEach(child => {
                        child.material.transparent = true
    
                        gsap.to(child.material, {
                            duration: 1,
                            opacity: 1,
                            ease: 'sine.in'
                        })
                    })
    
                    gsap.to(portalLightMaterial.uniforms.uAlpha, {
                        duration: 1,
                        value: 1,
                        ease: 'sine.in'
                    })
    
                    particles.fade(1, 1)
    
                    gsap.to(debugObject, {
                        duration: 1,
                        clearColor: '#353543', 
                        ease: 'sine.in',
                        onUpdate() {
                            renderer.setClearColor(debugObject.clearColor)
                        },
                        onComplete() {
                            gui.updateDisplay()
                        }
                    })

                    nat1 = false
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
    const elapsedTime = clock.getElapsedTime()

    stats.begin()

    // Update fireflies
    particles.animate(elapsedTime)

    // Update portal
    portalLightMaterial.uniforms.uTime.value = elapsedTime

    // Float Dice
    if (d20Model != null) {
        d20Model.position.y += Math.sin(elapsedTime * 2) * 0.001
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    stats.end()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
