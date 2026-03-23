import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import WebGPURenderer from 'three/src/renderers/webgpu/WebGPURenderer.js'
import { MATCAPS, ENVIRONMENTS, type SceneSettings, type EnvPreset, type RendererType } from '~/types/scene'

// Geometry factories
const GEOMETRIES: Record<string, () => THREE.BufferGeometry> = {
  'Torus Knot': () => new THREE.TorusKnotGeometry(0.7, 0.22, 128, 32),
  'Sphere': () => new THREE.SphereGeometry(1, 64, 64),
  'Torus': () => new THREE.TorusGeometry(0.7, 0.3, 32, 100),
  'Rounded Cube': () => createRoundedBox(1.2, 1.2, 1.2, 10),
  'Capsule': () => new THREE.CapsuleGeometry(0.55, 0.9, 16, 32),
  'Cylinder': () => new THREE.CylinderGeometry(0.65, 0.65, 1.4, 64, 1, false),
  'Handle': () => createHandleGeometry(),
  'Knob': () => createKnobGeometry(),
}

// --- Geometry helpers ---

function createRoundedBox(w: number, h: number, d: number, seg: number) {
  const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg)
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  const r = Math.min(w, h, d) * 0.5
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i))
    v.lerp(v.clone().normalize().multiplyScalar(r), 0.35)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return geo
}

function createHandleGeometry() {
  const path = new THREE.CurvePath<THREE.Vector3>()
  path.add(new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.8, 0, 0),
    new THREE.Vector3(-0.8, 0.6, 0),
    new THREE.Vector3(0.8, 0.6, 0),
    new THREE.Vector3(0.8, 0, 0),
  ))
  const tube = new THREE.TubeGeometry(path, 32, 0.08, 16, false)
  const cap1 = new THREE.SphereGeometry(0.12, 16, 16)
  cap1.translate(-0.8, 0, 0)
  const cap2 = new THREE.SphereGeometry(0.12, 16, 16)
  cap2.translate(0.8, 0, 0)
  return mergeBufferGeometries([tube, cap1, cap2])
}

function createKnobGeometry() {
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    let r: number
    if (t < 0.15) r = 0.15 + t * 1.0
    else if (t < 0.5) r = 0.30 + Math.sin((t - 0.15) / 0.35 * Math.PI * 0.5) * 0.35
    else r = 0.65 * Math.cos((t - 0.5) / 0.5 * Math.PI * 0.5)
    points.push(new THREE.Vector2(r, -0.5 + t * 1.0))
  }
  return new THREE.LatheGeometry(points, 32)
}

function mergeBufferGeometries(geos: THREE.BufferGeometry[]) {
  const positions: number[] = [], normals: number[] = [], indices: number[] = []
  let offset = 0
  for (const g of geos) {
    const pos = g.attributes.position, norm = g.attributes.normal, idx = g.index
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i))
    }
    if (idx) for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset)
    else for (let i = 0; i < pos.count; i++) indices.push(i + offset)
    offset += pos.count
  }
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  merged.setIndex(indices)
  merged.computeVertexNormals()
  return merged
}

// --- Text sprite for platform labels ---

function createTextSprite(text: string, color: string = '#e8a44a') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 256, 64)
  ctx.fillStyle = color
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 32)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(1.2, 0.3, 1)
  return sprite
}

// --- Main composable ---

export function useMatcapScene() {
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer | WebGPURenderer
  let controls: OrbitControls

  let matcapMesh: THREE.Mesh
  let pbrMesh: THREE.Mesh
  let platform: THREE.Mesh
  let matcapMaterial: THREE.MeshMatcapMaterial
  let pbrMaterial: THREE.MeshStandardMaterial

  let directionalLight: THREE.DirectionalLight
  let pointLight: THREE.PointLight
  let ambientLight: THREE.AmbientLight

  let matcapLabel: THREE.Sprite | null = null
  let pbrLabel: THREE.Sprite | null = null

  let envMap: THREE.Texture | null = null
  let animationId: number | null = null

  const textureLoader = new THREE.TextureLoader()
  const matcapTextures: Record<string, THREE.Texture> = {}

  let canvasEl: HTMLCanvasElement
  const webgpuSupported = ref(false)
  const activeRenderer = ref<RendererType>('webgl')

  const settings = reactive<SceneSettings>({
    renderer: 'webgl',
    matcap: 'steel',
    geometry: 'Torus Knot',
    environment: 'Studio',
    showPlatform: true,
    showLights: false,
    autoRotate: true,
    rotationSpeed: 0.5,
    comparisonMode: false,
    pbrMetalness: 0.85,
    pbrRoughness: 0.25,
    zoomLevel: 5,
  })

  async function init(canvas: HTMLCanvasElement) {
    canvasEl = canvas
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.set(0, 1.8, settings.zoomLevel)
    camera.lookAt(0, 0.6, 0)

    // Detect WebGPU support
    webgpuSupported.value = !!(navigator as any).gpu
    if (webgpuSupported.value) {
      settings.renderer = 'webgpu'
    }

    await createRenderer(canvas, settings.renderer)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2
    controls.maxDistance = 15
    controls.maxPolarAngle = Math.PI * 0.85
    controls.target.set(0, 0.6, 0)

    createLights()
    await createEnvironmentMap()
    scene.environment = envMap
    await loadMatcapTexture(settings.matcap)
    createMaterials()
    createPlatform()
    createMeshes()
    updateEnvironment()
    animate()
    window.addEventListener('resize', onWindowResize)
  }

  async function createRenderer(canvas: HTMLCanvasElement, type: RendererType) {
    if (type === 'webgpu') {
      try {
        renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true })
        await (renderer as WebGPURenderer).init()
        activeRenderer.value = 'webgpu'
      } catch (e) {
        console.warn('WebGPU init failed, falling back to WebGL:', e)
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        activeRenderer.value = 'webgl'
        settings.renderer = 'webgl'
        webgpuSupported.value = false
      }
    } else {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      activeRenderer.value = 'webgl'
    }

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    if ('shadowMap' in renderer) {
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
  }

  async function switchRenderer() {
    if (animationId) cancelAnimationFrame(animationId)
    animationId = null

    const oldTarget = controls.target.clone()
    const oldCamPos = camera.position.clone()
    controls.dispose()
    renderer.dispose()

    await createRenderer(canvasEl, settings.renderer)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2
    controls.maxDistance = 15
    controls.maxPolarAngle = Math.PI * 0.85
    controls.target.copy(oldTarget)
    camera.position.copy(oldCamPos)

    // Recreate environment map with new renderer
    await createEnvironmentMap()
    scene.environment = settings.showLights ? null : envMap
    // Re-assign env map to PBR material
    if (pbrMaterial) {
      pbrMaterial.envMap = envMap
      pbrMaterial.needsUpdate = true
    }
    if (platform?.material instanceof THREE.MeshStandardMaterial) {
      platform.material.envMap = envMap
      platform.material.needsUpdate = true
    }

    updateEnvironment()
    animate()
  }

  function createLights() {
    directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(5, 8, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.visible = settings.showLights
    scene.add(directionalLight)

    pointLight = new THREE.PointLight(0xffc888, 1, 20)
    pointLight.position.set(-3, 3, -3)
    pointLight.visible = settings.showLights
    scene.add(pointLight)

    ambientLight = new THREE.AmbientLight(0x504840, 0.5)
    ambientLight.visible = settings.showLights
    scene.add(ambientLight)
  }

  async function createEnvironmentMap() {
    const pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()

    const envScene = new THREE.Scene()
    const gradMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0.35, 0.33, 0.3) },
        bottomColor: { value: new THREE.Color(0.12, 0.12, 0.11) },
      },
      vertexShader: `varying vec3 vWP; void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 topColor;uniform vec3 bottomColor;varying vec3 vWP;void main(){float h=normalize(vWP).y;gl_FragColor=vec4(mix(bottomColor,topColor,h*0.5+0.5),1.0);}`,
    })
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), gradMat))
    const envLight1 = new THREE.PointLight(0xffffff, 80, 100)
    envLight1.position.set(8, 8, 8)
    envScene.add(envLight1)
    const envLight2 = new THREE.PointLight(0xffd4a0, 40, 100)
    envLight2.position.set(-8, 5, -8)
    envScene.add(envLight2)

    envMap = pmrem.fromScene(envScene, 0.04).texture
    pmrem.dispose()
  }

  async function loadMatcapTexture(name: string) {
    if (matcapTextures[name]) return matcapTextures[name]
    return new Promise<THREE.Texture>((resolve) => {
      textureLoader.load(
        MATCAPS[name].path,
        (tex) => { tex.colorSpace = THREE.SRGBColorSpace; matcapTextures[name] = tex; resolve(tex) },
        undefined,
        () => { console.warn(`Failed to load matcap: ${name}`); resolve(matcapTextures['chrome'] || new THREE.Texture()) }
      )
    })
  }

  function createMaterials() {
    matcapMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTextures[settings.matcap] })

    const info = MATCAPS[settings.matcap]
    pbrMaterial = new THREE.MeshStandardMaterial({
      color: info.color,
      metalness: info.metalness,
      roughness: info.roughness,
      envMap,
      envMapIntensity: 2.0,
    })
    settings.pbrMetalness = info.metalness
    settings.pbrRoughness = info.roughness
  }

  function createPlatform() {
    const geo = new THREE.CylinderGeometry(2.5, 2.8, 0.15, 64)
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.6, roughness: 0.5, envMap })
    platform = new THREE.Mesh(geo, mat)
    platform.position.y = -0.5
    platform.receiveShadow = true
    platform.visible = settings.showPlatform
    scene.add(platform)
  }

  function createMeshes() {
    if (matcapMesh) { scene.remove(matcapMesh); matcapMesh.geometry.dispose() }
    if (pbrMesh) { scene.remove(pbrMesh); pbrMesh.geometry.dispose() }

    const geometry = GEOMETRIES[settings.geometry]()
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox!
    const platformTopY = -0.5 + 0.075
    const meshY = platformTopY + (-bbox.min.y) + 0.05

    matcapMesh = new THREE.Mesh(geometry, matcapMaterial)
    matcapMesh.position.y = meshY
    matcapMesh.castShadow = true
    scene.add(matcapMesh)

    pbrMesh = new THREE.Mesh(geometry.clone(), pbrMaterial)
    pbrMesh.position.y = meshY
    pbrMesh.castShadow = true
    pbrMesh.visible = false
    scene.add(pbrMesh)

    updateMeshPositions()
  }

  function updateMeshPositions() {
    // Remove old labels
    if (matcapLabel) { scene.remove(matcapLabel); matcapLabel = null }
    if (pbrLabel) { scene.remove(pbrLabel); pbrLabel = null }

    if (settings.comparisonMode) {
      matcapMesh.position.x = -1.5
      pbrMesh.position.x = 1.5
      pbrMesh.visible = true

      // Add labels on the platform
      matcapLabel = createTextSprite('MATCAP')
      matcapLabel.position.set(-1.5, -0.35, 1.8)
      scene.add(matcapLabel)

      pbrLabel = createTextSprite('PBR')
      pbrLabel.position.set(1.5, -0.35, 1.8)
      scene.add(pbrLabel)
    } else {
      matcapMesh.position.x = 0
      pbrMesh.visible = false
    }
  }

  function updateEnvironment() {
    const env = ENVIRONMENTS[settings.environment] as EnvPreset
    if (env.type === 'gradient') {
      const canvas = document.createElement('canvas')
      canvas.width = 2; canvas.height = 512
      const ctx = canvas.getContext('2d')!
      const grad = ctx.createLinearGradient(0, 0, 0, 512)
      for (const s of env.stops) grad.addColorStop(s.pos, s.color)
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 2, 512)
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      scene.background = tex
    } else {
      scene.background = new THREE.Color(env.color)
    }
    if (platform?.material instanceof THREE.MeshStandardMaterial) {
      platform.material.color.set(env.ground)
    }
  }

  function updateLightsVisibility() {
    directionalLight.visible = pointLight.visible = ambientLight.visible = settings.showLights
    scene.environment = settings.showLights ? null : envMap
  }

  async function updateMatcap() {
    await loadMatcapTexture(settings.matcap)
    matcapMaterial.matcap = matcapTextures[settings.matcap]
    matcapMaterial.needsUpdate = true
    const info = MATCAPS[settings.matcap]
    if (pbrMaterial) {
      pbrMaterial.color.setHex(info.color)
      pbrMaterial.metalness = info.metalness
      pbrMaterial.roughness = info.roughness
      pbrMaterial.needsUpdate = true
      settings.pbrMetalness = info.metalness
      settings.pbrRoughness = info.roughness
    }
  }

  function updatePBRMaterial() {
    pbrMaterial.metalness = settings.pbrMetalness
    pbrMaterial.roughness = settings.pbrRoughness
  }

  function updateZoom() {
    const d = settings.zoomLevel, a = controls.getAzimuthalAngle(), p = controls.getPolarAngle()
    camera.position.set(d * Math.sin(p) * Math.sin(a), d * Math.cos(p), d * Math.sin(p) * Math.cos(a))
  }

  function zoomIn() { settings.zoomLevel = Math.max(2, settings.zoomLevel - 0.5); updateZoom() }
  function zoomOut() { settings.zoomLevel = Math.min(15, settings.zoomLevel + 0.5); updateZoom() }
  function resetView() { settings.zoomLevel = 5; camera.position.set(0, 1.8, 5); controls.target.set(0, 0.6, 0); controls.update() }
  function getCamera() { return camera }
  function getControls() { return controls }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function animate() {
    animationId = requestAnimationFrame(animate)
    controls.update()
    if (settings.autoRotate) {
      const s = settings.rotationSpeed * 0.01
      matcapMesh.rotation.y += s
      pbrMesh.rotation.y += s
    }
    renderer.render(scene, camera)
  }

  function dispose() {
    if (animationId) cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onWindowResize)
    renderer?.dispose()
    matcapMaterial?.dispose()
    pbrMaterial?.dispose()
    matcapMesh?.geometry.dispose()
    pbrMesh?.geometry.dispose()
    Object.values(matcapTextures).forEach(t => t.dispose())
  }

  // Watchers
  watch(() => settings.renderer, switchRenderer)
  watch(() => settings.matcap, updateMatcap)
  watch(() => settings.geometry, createMeshes)
  watch(() => settings.environment, updateEnvironment)
  watch(() => settings.showPlatform, () => { if (platform) platform.visible = settings.showPlatform })
  watch(() => settings.showLights, updateLightsVisibility)
  watch(() => settings.comparisonMode, updateMeshPositions)
  watch(() => settings.pbrMetalness, updatePBRMaterial)
  watch(() => settings.pbrRoughness, updatePBRMaterial)

  return { settings, webgpuSupported, activeRenderer, init, dispose, zoomIn, zoomOut, resetView, getCamera, getControls, MATCAPS, GEOMETRIES, ENVIRONMENTS }
}
