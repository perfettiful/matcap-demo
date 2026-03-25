import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { MATCAPS, ENVIRONMENTS, type SceneSettings, type EnvPreset, type MatcapEntry } from '~/types/scene'

// Geometry factories
const GEOMETRIES: Record<string, () => THREE.BufferGeometry> = {
  'Torus Knot': () => new THREE.TorusKnotGeometry(0.7, 0.22, 128, 32),
  'Sphere': () => new THREE.SphereGeometry(1, 64, 64),
  'Torus': () => new THREE.TorusGeometry(0.7, 0.3, 32, 100),
  'Rounded Cube': () => createRoundedBox(1.2, 1.2, 1.2, 10),
  'Shower Head': () => createShowerHeadGeometry(),
  'Angle Stop Valve': () => createAngleStopValveGeometry(),
  'Tub Spout': () => createTubSpoutGeometry(),
  'Lever Handle': () => createLeverHandleGeometry(),
  'Escutcheon Plate': () => createEscutcheonPlateGeometry(),
  'Towel Ring': () => createTowelRingGeometry(),
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

function createShowerHeadGeometry() {
  const wallFlange = new THREE.CylinderGeometry(0.23, 0.23, 0.08, 28, 1, false)
  wallFlange.rotateZ(Math.PI / 2)
  wallFlange.translate(-0.82, 0.18, 0)

  const arm = new THREE.CylinderGeometry(0.07, 0.08, 0.9, 24, 1, false)
  arm.rotateZ(Math.PI / 2)
  arm.translate(-0.36, 0.18, 0)

  const elbow = new THREE.SphereGeometry(0.125, 18, 18)
  elbow.translate(0.05, 0.18, 0)

  const neck = new THREE.CylinderGeometry(0.085, 0.1, 0.58, 24, 1, false)
  neck.rotateZ(-0.78)
  neck.translate(0.26, 0.34, 0)

  const neckBlend = new THREE.SphereGeometry(0.16, 18, 18)
  neckBlend.translate(0.47, 0.54, 0)

  const headStem = new THREE.CylinderGeometry(0.13, 0.16, 0.2, 24, 1, false)
  headStem.rotateZ(Math.PI / 2)
  headStem.translate(0.58, 0.56, 0)

  const backCap = new THREE.CylinderGeometry(0.34, 0.42, 0.16, 32, 1, false)
  backCap.rotateZ(Math.PI / 2)
  backCap.translate(0.67, 0.58, 0)

  const headBody = new THREE.CylinderGeometry(0.5, 0.46, 0.26, 40, 1, false)
  headBody.rotateZ(Math.PI / 2)
  headBody.translate(0.86, 0.58, 0)

  const facePlate = new THREE.CylinderGeometry(0.5, 0.5, 0.03, 40, 1, false)
  facePlate.rotateZ(Math.PI / 2)
  facePlate.translate(1.0, 0.58, 0)

  const rim = new THREE.TorusGeometry(0.5, 0.02, 10, 36)
  rim.rotateY(Math.PI / 2)
  rim.translate(0.995, 0.58, 0)

  return mergeBufferGeometries([wallFlange, arm, elbow, neck, neckBlend, headStem, backCap, headBody, facePlate, rim])
}

function createAngleStopValveGeometry() {
  const body = new THREE.CylinderGeometry(0.17, 0.17, 0.82, 24, 1, false)
  body.rotateZ(Math.PI / 2)
  body.translate(0.1, 0, 0)

  const outlet = new THREE.CylinderGeometry(0.11, 0.11, 0.65, 24, 1, false)
  outlet.translate(-0.28, 0.32, 0)

  const hub = new THREE.SphereGeometry(0.18, 18, 18)
  hub.translate(-0.28, 0, 0)

  const knob = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 24, 1, false)
  knob.rotateX(Math.PI / 2)
  knob.translate(-0.28, -0.06, 0)

  const crossA = new THREE.BoxGeometry(0.5, 0.08, 0.08)
  crossA.translate(-0.28, -0.06, 0)
  const crossB = new THREE.BoxGeometry(0.08, 0.32, 0.08)
  crossB.translate(-0.28, -0.06, 0)

  return mergeBufferGeometries([body, outlet, hub, knob, crossA, crossB])
}

function createTubSpoutGeometry() {
  const body = new THREE.CylinderGeometry(0.18, 0.18, 1.45, 32, 1, false)
  body.rotateZ(Math.PI / 2)
  body.translate(0.15, 0.28, 0)

  const neck = new THREE.CylinderGeometry(0.22, 0.22, 0.5, 32, 1, false)
  neck.translate(-0.55, 0.02, 0)

  const flare = new THREE.CylinderGeometry(0.1, 0.18, 0.38, 32, 1, false)
  flare.rotateZ(Math.PI / 2)
  flare.translate(0.95, 0.28, 0)

  const lip = new THREE.TorusGeometry(0.1, 0.022, 12, 24)
  lip.rotateY(Math.PI / 2)
  lip.translate(1.11, 0.28, 0)

  return mergeBufferGeometries([body, neck, flare, lip])
}

function createLeverHandleGeometry() {
  const base = new THREE.CylinderGeometry(0.18, 0.22, 0.18, 32, 1, false)
  base.translate(0, -0.22, 0)

  const arm = new THREE.CylinderGeometry(0.075, 0.09, 1.4, 24, 1, false)
  arm.rotateZ(-Math.PI / 2)
  arm.rotateY(0.22)
  arm.translate(0.55, 0.02, 0)

  const tip = new THREE.SphereGeometry(0.1, 18, 18)
  tip.translate(1.2, 0.05, -0.05)

  const hub = new THREE.CylinderGeometry(0.1, 0.12, 0.16, 24, 1, false)
  hub.translate(0.08, -0.08, 0)

  return mergeBufferGeometries([base, hub, arm, tip])
}

function createEscutcheonPlateGeometry() {
  const profile = [
    // Start at a real inner opening so the lathe doesn't collapse to a wrinkled pole.
    new THREE.Vector2(0.18, -0.03),
    new THREE.Vector2(0.62, -0.032),
    new THREE.Vector2(0.8, -0.028),
    new THREE.Vector2(0.9, -0.012),
    new THREE.Vector2(0.94, 0),
    new THREE.Vector2(0.9, 0.012),
    new THREE.Vector2(0.8, 0.028),
    new THREE.Vector2(0.62, 0.032),
    new THREE.Vector2(0.18, 0.03),
  ]
  // Offset the lathe seam away from the visible front face.
  const plate = new THREE.LatheGeometry(profile, 128, Math.PI, Math.PI * 2)

  const collar = new THREE.TorusGeometry(0.22, 0.05, 12, 32)
  collar.rotateX(Math.PI / 2)

  return mergeBufferGeometries([plate, collar])
}

function createTowelRingGeometry() {
  const ring = new THREE.TorusGeometry(0.72, 0.07, 16, 64)
  ring.translate(0.18, 0.1, 0)

  const arm = new THREE.CylinderGeometry(0.05, 0.06, 0.42, 18, 1, false)
  arm.rotateZ(Math.PI / 2)
  arm.translate(-0.4, 0.1, 0)

  const mount = new THREE.CylinderGeometry(0.14, 0.16, 0.12, 24, 1, false)
  mount.translate(-0.64, 0.1, 0)

  const join = new THREE.SphereGeometry(0.075, 14, 14)
  join.translate(-0.18, 0.1, 0)

  return mergeBufferGeometries([ring, arm, mount, join])
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

// --- Platform label (flat decal on surface) ---

function createPlatformLabel(text: string): THREE.Mesh {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 88
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 640, 88)

  // Bold highlight-yellow lettering
  ctx.fillStyle = 'rgba(232, 164, 74, 0.75)'
  ctx.font = '700 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '6px'
  ctx.fillText(text, 320, 44)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace

  const geo = new THREE.PlaneGeometry(1.45, 0.26)
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geo, mat)
  // Lay flat on the platform, face up
  mesh.rotation.x = -Math.PI / 2
  return mesh
}

// --- Main composable ---

export function useMatcapScene() {
  const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 2.35, 6.2)
  const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0.6, 0)

  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let controls: OrbitControls

  let matcapMesh: THREE.Mesh
  let pbrMesh: THREE.Mesh
  let platform: THREE.Mesh
  let matcapMaterial: THREE.MeshMatcapMaterial
  let pbrMaterial: THREE.MeshStandardMaterial

  let directionalLight: THREE.DirectionalLight
  let pointLight: THREE.PointLight
  let ambientLight: THREE.AmbientLight

  let matcapLabel: THREE.Mesh | null = null
  let pbrLabel: THREE.Mesh | null = null

  let envMap: THREE.Texture | null = null
  let backgroundTexture: THREE.Texture | null = null
  let animationId: number | null = null
  let cameraTweenId: number | null = null

  const textureLoader = new THREE.TextureLoader()
  const matcapTextures: Record<string, THREE.Texture> = {}
  const baseURL = useRuntimeConfig().app.baseURL

  const settings = reactive<SceneSettings>({
    matcap: 'steel',
    geometry: 'Torus Knot',
    environment: 'Studio',
    showPlatform: true,
    showLights: true,
    autoRotate: true,
    rotationSpeed: 0.2,
    comparisonMode: true,
    pbrMetalness: 0.85,
    pbrRoughness: 0.25,
    zoomLevel: DEFAULT_CAMERA_POSITION.distanceTo(DEFAULT_CAMERA_TARGET),
  })

  async function init(canvas: HTMLCanvasElement) {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.copy(DEFAULT_CAMERA_POSITION)
    camera.lookAt(DEFAULT_CAMERA_TARGET)

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2
    controls.maxDistance = 15
    controls.minPolarAngle = 0.12
    // Keep the camera above the platform so you never orbit underneath the scene.
    controls.maxPolarAngle = Math.PI * 0.49
    controls.target.copy(DEFAULT_CAMERA_TARGET)

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

  function setBackgroundTexture(texture: THREE.Texture) {
    backgroundTexture?.dispose()
    backgroundTexture = texture
    scene.background = texture
  }

  function createSkyBackground(isNight: boolean) {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    function drawFluffyCloud(x: number, y: number, scale: number, alpha: number) {
      const puffs = [
        { dx: -120, dy: 28, rx: 76, ry: 40 },
        { dx: -48, dy: 6, rx: 92, ry: 56 },
        { dx: 34, dy: -6, rx: 116, ry: 66 },
        { dx: 132, dy: 18, rx: 82, ry: 46 },
        { dx: 24, dy: 42, rx: 170, ry: 34 },
      ]

      ctx.save()
      ctx.globalAlpha = alpha
      for (const puff of puffs) {
        const cx = x + puff.dx * scale
        const cy = y + puff.dy * scale
        const rx = puff.rx * scale
        const ry = puff.ry * scale
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
        g.addColorStop(0, 'rgba(255,255,255,0.95)')
        g.addColorStop(0.58, 'rgba(245,250,255,0.82)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    if (isNight) {
      grad.addColorStop(0, '#08111f')
      grad.addColorStop(0.35, '#10233f')
      grad.addColorStop(0.72, '#21395a')
      grad.addColorStop(1, '#41536e')
    } else {
      grad.addColorStop(0, '#5b8fbf')
      grad.addColorStop(0.3, '#7badd4')
      grad.addColorStop(0.58, '#a8cce4')
      grad.addColorStop(0.8, '#d4e4ef')
      grad.addColorStop(1, '#eef5fa')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (isNight) {
      for (let i = 0; i < 140; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height * 0.78
        const r = Math.random() * 1.6 + 0.3
        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${0.35 + Math.random() * 0.55})`
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      const moonX = canvas.width * 0.78
      const moonY = canvas.height * 0.19
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 54)
      moonGrad.addColorStop(0, 'rgba(255, 248, 220, 0.95)')
      moonGrad.addColorStop(0.55, 'rgba(255, 248, 220, 0.35)')
      moonGrad.addColorStop(1, 'rgba(255, 248, 220, 0)')
      ctx.fillStyle = moonGrad
      ctx.beginPath()
      ctx.arc(moonX, moonY, 54, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255, 248, 220, 0.92)'
      ctx.beginPath()
      ctx.arc(moonX, moonY, 19, 0, Math.PI * 2)
      ctx.fill()
    } else {
      drawFluffyCloud(250, 250, 1.1, 0.82)
      drawFluffyCloud(760, 205, 0.82, 0.72)
      drawFluffyCloud(655, 360, 1.02, 0.76)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }

  function getReadablePlatformColor(colorValue: string | number) {
    const color = new THREE.Color(colorValue)
    const hsl = { h: 0, s: 0, l: 0 }
    color.getHSL(hsl)

    // Lift only the darkest grounds so cast shadows stay visible.
    if (hsl.l < 0.12) color.offsetHSL(0, 0, 0.065)
    else if (hsl.l < 0.18) color.offsetHSL(0, 0, 0.045)
    else if (hsl.l < 0.24) color.offsetHSL(0, 0, 0.02)

    return color
  }

  function getMatcapInfo(name: string): MatcapEntry {
    return MATCAPS[name] ?? MATCAPS.steel!
  }

  function getGeometryFactory(name: string): () => THREE.BufferGeometry {
    return GEOMETRIES[name] ?? GEOMETRIES['Torus Knot']!
  }

  async function loadMatcapTexture(name: string) {
    const info = getMatcapInfo(name)
    if (matcapTextures[name]) return matcapTextures[name]
    return new Promise<THREE.Texture>((resolve) => {
      textureLoader.load(
        baseURL + info.path.replace(/^\//, ''),
        (tex: THREE.Texture) => { tex.colorSpace = THREE.SRGBColorSpace; matcapTextures[name] = tex; resolve(tex) },
        undefined,
        () => { console.warn(`Failed to load matcap: ${name}`); resolve(matcapTextures['chrome'] || new THREE.Texture()) }
      )
    })
  }

  function createMaterials() {
    matcapMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTextures[settings.matcap] })

    const info = getMatcapInfo(settings.matcap)
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

    const geometry = getGeometryFactory(settings.geometry)()
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

    // Some shapes benefit from a more product-shot-like resting angle.
    if (settings.geometry === 'Knob') {
      matcapMesh.rotation.x = 0.56
      matcapMesh.rotation.z = 0.12
      pbrMesh.rotation.x = 0.56
      pbrMesh.rotation.z = 0.12
    }

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

      // Flat labels on the platform surface
      const platformTopY = -0.5 + 0.075 + 0.005 // just above platform
      matcapLabel = createPlatformLabel('MATCAP')
      matcapLabel.position.set(-1.5, platformTopY, 1.6)
      scene.add(matcapLabel)

      pbrLabel = createPlatformLabel('PBR')
      pbrLabel.position.set(1.5, platformTopY, 1.6)
      scene.add(pbrLabel)
    } else {
      matcapMesh.position.x = 0
      pbrMesh.visible = false
    }
  }

  function updateEnvironment() {
    const env = ENVIRONMENTS[settings.environment] as EnvPreset
    if (settings.environment === 'Sky') {
      setBackgroundTexture(createSkyBackground(!settings.showLights))
      if (platform?.material instanceof THREE.MeshStandardMaterial) {
        platform.material.color.copy(getReadablePlatformColor(settings.showLights ? 0x8a9a6a : 0x2d3647))
      }
      return
    }

    if (env.type === 'gradient') {
      const canvas = document.createElement('canvas')
      canvas.width = 2; canvas.height = 512
      const ctx = canvas.getContext('2d')!
      const grad = ctx.createLinearGradient(0, 0, 0, 512)
      for (const s of env.stops) grad.addColorStop(s.pos, s.color)
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 2, 512)
      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      setBackgroundTexture(tex)
    } else {
      backgroundTexture?.dispose()
      backgroundTexture = null
      scene.background = new THREE.Color(env.color)
    }
    if (platform?.material instanceof THREE.MeshStandardMaterial) {
      platform.material.color.copy(getReadablePlatformColor(env.ground))
    }
  }

  function updateLightsVisibility() {
    directionalLight.visible = pointLight.visible = ambientLight.visible = settings.showLights
    scene.environment = settings.showLights ? null : envMap
    updateEnvironment()
  }

  async function updateMatcap() {
    await loadMatcapTexture(settings.matcap)
    matcapMaterial.matcap = matcapTextures[settings.matcap]
    matcapMaterial.needsUpdate = true
    const info = getMatcapInfo(settings.matcap)
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

  function animateCamera(position: THREE.Vector3, target: THREE.Vector3, duration = 650) {
    if (!camera || !controls) return
    if (cameraTweenId) cancelAnimationFrame(cameraTweenId)

    const startPos = camera.position.clone()
    const startTarget = controls.target.clone()
    const startZoom = settings.zoomLevel
    const endZoom = position.distanceTo(target)
    const startTime = performance.now()

    const ease = (t: number) => (t < 0.5)
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2

    const step = (now: number) => {
      const raw = Math.min(1, (now - startTime) / duration)
      const t = ease(raw)
      camera.position.lerpVectors(startPos, position, t)
      controls.target.lerpVectors(startTarget, target, t)
      settings.zoomLevel = startZoom + (endZoom - startZoom) * t
      camera.lookAt(controls.target)
      controls.update()

      if (raw < 1) {
        cameraTweenId = requestAnimationFrame(step)
      } else {
        cameraTweenId = null
      }
    }

    cameraTweenId = requestAnimationFrame(step)
  }

  function updateZoom() {
    const d = settings.zoomLevel, a = controls.getAzimuthalAngle(), p = controls.getPolarAngle()
    camera.position.set(d * Math.sin(p) * Math.sin(a), d * Math.cos(p), d * Math.sin(p) * Math.cos(a))
  }

  function zoomIn() { settings.zoomLevel = Math.max(2, settings.zoomLevel - 0.5); updateZoom() }
  function zoomOut() { settings.zoomLevel = Math.min(15, settings.zoomLevel + 0.5); updateZoom() }
  function resetView() {
    animateCamera(DEFAULT_CAMERA_POSITION.clone(), DEFAULT_CAMERA_TARGET.clone())
  }
  function focusObject() {
    animateCamera(new THREE.Vector3(0, 1.25, 3.6), new THREE.Vector3(0, 0.6, 0), 520)
  }
  function snapToView(view: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom') {
    const target = controls.target.clone()
    const distance = camera.position.distanceTo(target)

    const offsets = {
      front: new THREE.Vector3(0, 0, distance),
      back: new THREE.Vector3(0, 0, -distance),
      left: new THREE.Vector3(-distance, 0, 0),
      right: new THREE.Vector3(distance, 0, 0),
      top: new THREE.Vector3(0, distance * 0.98, 0.14),
      bottom: new THREE.Vector3(0, -distance * 0.98, 0.14),
    } as const

    animateCamera(target.clone().add(offsets[view]), target, 760)
  }
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

  function disposeLabel(label: THREE.Mesh | null) {
    if (!label) return
    label.geometry.dispose()
    if (label.material instanceof THREE.Material) label.material.dispose()
    scene?.remove(label)
  }

  function dispose() {
    if (animationId) cancelAnimationFrame(animationId)
    if (cameraTweenId) cancelAnimationFrame(cameraTweenId)
    window.removeEventListener('resize', onWindowResize)
    disposeLabel(matcapLabel)
    disposeLabel(pbrLabel)
    backgroundTexture?.dispose()
    renderer?.dispose()
    matcapMaterial?.dispose()
    pbrMaterial?.dispose()
    matcapMesh?.geometry.dispose()
    pbrMesh?.geometry.dispose()
    Object.values(matcapTextures).forEach(t => t.dispose())
  }

  // Watchers
  watch(() => settings.matcap, updateMatcap)
  watch(() => settings.geometry, createMeshes)
  watch(() => settings.environment, updateEnvironment)
  watch(() => settings.showPlatform, () => { if (platform) platform.visible = settings.showPlatform })
  watch(() => settings.showLights, updateLightsVisibility)
  watch(() => settings.comparisonMode, updateMeshPositions)
  watch(() => settings.pbrMetalness, updatePBRMaterial)
  watch(() => settings.pbrRoughness, updatePBRMaterial)

  return { settings, init, dispose, zoomIn, zoomOut, resetView, focusObject, snapToView, getCamera, getControls, MATCAPS, GEOMETRIES, ENVIRONMENTS }
}
