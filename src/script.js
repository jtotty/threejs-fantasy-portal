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
import DiceRoll from './modules/diceRoll.js'

// FPS Counter
import Stats from 'stats.js'

// Shaders
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
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
    stats.dom.classList.add('hide-stats')
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
 const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        onLoaded()
        gsap.delayedCall(0.5, () => {
            gsap.to(loadingScreen.uAlpha, { duration: 0.5, value: 0 })
            loadingScreen.loaded()
            generateFireflies()
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
 
 // Loading Screen
 const loadingScreen = new LoadingScreen()
 scene.add(loadingScreen.overlay)
 
 // Axis Helper
 const axesHelper = new THREE.AxesHelper( 5 );
 scene.add(axesHelper);

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
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})

/**
 * Main scene
 */
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

        scene.add(gltf.scene)
    }
)

/**
 * d20 Dice
 */
let d20Model
gltfLoader.load(
    'd20.glb',
    gltf => {
        const d20Mesh = gltf.scene.children.find(child => child.name === 'd20')
        d20Mesh.scale.set(0.06, 0.06, 0.06)
        d20Mesh.position.set(0, 2.05, - 1.8)
        d20Mesh.material = d20Material
        d20Model = d20Mesh
        scene.add(d20Model)
    }
)

/**
 * Fireflies
 */
debugObject.firefliesCount = 5000
debugObject.firefliesSize = 70 * (window.innerHeight / 1440)
debugObject.insideColor = '#ffffff'
debugObject.outsideColor = '#0f3dac'

let firefliesGeometry = null
let firefliesMaterial = null
let fireflies = null

const generateFireflies = () =>
{
    if (fireflies !== null) {
        firefliesGeometry.dispose()
        firefliesMaterial.dispose()
        scene.remove(fireflies)
    }

    // Geometry
    firefliesGeometry = new THREE.BufferGeometry()

    const positionArray = new Float32Array(debugObject.firefliesCount * 3)
    const colorsArray = new Float32Array(debugObject.firefliesCount * 3)
    const scaleArray = new Float32Array(debugObject.firefliesCount)

    const insideColor = new THREE.Color(debugObject.insideColor)
    const outsideColor = new THREE.Color(debugObject.outsideColor)

    for (let i = 0; i < debugObject.firefliesCount; i++) {
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

    firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(positionArray, 1))
    firefliesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))

    // Material
    firefliesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uSize: { value: debugObject.firefliesSize }
        },
        vertexColors: true,
        vertexShader: firefliesVertexShader,
        fragmentShader: firefliesFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })

    // Points
    fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
    scene.add(fireflies)
}

gui.add(debugObject, 'firefliesSize').min(0).max(100).step(1).onFinishChange(generateFireflies)
gui.add(debugObject, 'firefliesCount').min(0).max(10000).step(10).onFinishChange(generateFireflies)
gui.addColor(debugObject, 'insideColor').onFinishChange(generateFireflies)
gui.addColor(debugObject, 'outsideColor').onFinishChange(generateFireflies)

/**
 * Portal
 */
// Geometry

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

        // Update fireflies
        firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
        
        const size = 70 * (window.innerHeight / 1440)
        firefliesMaterial.uniforms.uSize.value = size
        debugObject.firefliesSize = size
        gui.updateDisplay()
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

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // Update fireflies
    if (fireflies != null) {
        firefliesMaterial.uniforms.uTime.value = elapsedTime
    }

    // Update portal
    portalLightMaterial.uniforms.uTime.value = elapsedTime

    if (d20Model) {
        d20Model.rotation.x = elapsedTime * 0.5
        d20Model.rotation.y = elapsedTime
        d20Model.rotation.z = elapsedTime * 1.5
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
