<script setup lang="ts">
import * as THREE from 'three'

const props = defineProps<{
  getCamera: () => THREE.PerspectiveCamera
  getControls: () => any
}>()

const cubeCanvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
let cubeRenderer: THREE.WebGLRenderer
let cubeScene: THREE.Scene
let cubeCamera: THREE.PerspectiveCamera
let cubeMesh: THREE.Group
let animId: number | null = null
let lastMouse = { x: 0, y: 0 }

function makeTextTexture(text: string, bgColor: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, 64, 64)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.strokeRect(1, 1, 62, 62)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 32, 34)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

onMounted(() => {
  if (!cubeCanvas.value) return
  const size = 64

  cubeRenderer = new THREE.WebGLRenderer({ canvas: cubeCanvas.value, antialias: true, alpha: true })
  cubeRenderer.setSize(size, size)
  cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  cubeScene = new THREE.Scene()
  cubeCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cubeCamera.position.set(0, 0, 4.5)

  cubeMesh = new THREE.Group()

  const labels = ['R', 'L', 'T', 'B', 'F', 'K']
  const colors = ['#8a3030', '#30708a', '#3a7a3a', '#8a7a30', '#3a4080', '#703a70']
  const materials = labels.map((text, i) => new THREE.MeshBasicMaterial({ map: makeTextTexture(text, colors[i]) }))

  const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), materials)
  cubeMesh.add(box)

  // Axis lines
  const al = 1.0
  const addAxis = (to: THREE.Vector3, color: number) => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), to])
    cubeMesh.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })))
  }
  addAxis(new THREE.Vector3(al, 0, 0), 0x8a3030)
  addAxis(new THREE.Vector3(0, al, 0), 0x3a7a3a)
  addAxis(new THREE.Vector3(0, 0, al), 0x3a4080)

  cubeScene.add(cubeMesh)
  cubeScene.add(new THREE.AmbientLight(0xffffff, 1))

  cubeCanvas.value.addEventListener('mousedown', onMouseDown)
  cubeCanvas.value.addEventListener('touchstart', onTouchStart, { passive: false })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)

  animate()
})

function onMouseDown(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  lastMouse = { x: e.clientX, y: e.clientY }
}

function onTouchStart(e: TouchEvent) {
  e.preventDefault()
  isDragging.value = true
  lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function applyDrag(clientX: number, clientY: number) {
  if (!isDragging.value) return
  const dx = clientX - lastMouse.x
  const dy = clientY - lastMouse.y
  lastMouse = { x: clientX, y: clientY }

  try {
    const controls = props.getControls()
    const camera = props.getCamera()
    if (!controls || !camera) return

    const azimuth = controls.getAzimuthalAngle() - dx * 0.015
    const polar = Math.max(0.1, Math.min(Math.PI - 0.1, controls.getPolarAngle() + dy * 0.015))
    const dist = camera.position.distanceTo(controls.target)

    camera.position.x = controls.target.x + dist * Math.sin(polar) * Math.sin(azimuth)
    camera.position.y = controls.target.y + dist * Math.cos(polar)
    camera.position.z = controls.target.z + dist * Math.sin(polar) * Math.cos(azimuth)
    camera.lookAt(controls.target)
    controls.update()
  } catch {}
}

function onMouseMove(e: MouseEvent) { applyDrag(e.clientX, e.clientY) }
function onTouchMove(e: TouchEvent) { e.preventDefault(); applyDrag(e.touches[0].clientX, e.touches[0].clientY) }
function onMouseUp() { isDragging.value = false }
function onTouchEnd() { isDragging.value = false }

function animate() {
  animId = requestAnimationFrame(animate)
  try {
    const mainCamera = props.getCamera()
    if (mainCamera) {
      cubeMesh.quaternion.copy(mainCamera.quaternion.clone().invert())
    }
  } catch {}
  cubeRenderer.render(cubeScene, cubeCamera)
}

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  cubeRenderer?.dispose()
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div
    :style="{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 35,
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(50, 50, 56, 0.6)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
    }"
  >
    <canvas ref="cubeCanvas" width="64" height="64" :style="{ display: 'block', width: '64px', height: '64px' }" />
  </div>
</template>
