<script setup lang="ts">
import * as THREE from 'three'
import { Focus, House } from 'lucide-vue-next'

const props = defineProps<{
  getCamera: () => THREE.PerspectiveCamera
  getControls: () => any
  onResetView?: () => void
  onFocusObject?: () => void
  onSnapView?: (view: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom') => void
}>()

const cubeCanvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
let cubeRenderer: THREE.WebGLRenderer
let cubeScene: THREE.Scene
let cubeCamera: THREE.PerspectiveCamera
let cubeMesh: THREE.Group
let cubeBox: THREE.Mesh
let animId: number | null = null
let lastMouse = { x: 0, y: 0 }
const isHovering = ref(false)
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let dragDistance = 0
let hoveredFace: number | null = null
const faceLabels = ['R', 'L', 'U', 'D', 'F', 'B']
const faceColors = ['#a23c3c', '#355f9f', '#4b8a48', '#9a7b36', '#5a5fc0', '#6c4e91']
const baseTextures: THREE.CanvasTexture[] = []
const hoverTextures: THREE.CanvasTexture[] = []
const materials: THREE.MeshBasicMaterial[] = []

function makeTextTexture(text: string, bgColor: string, highlighted = false) {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 96
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 96, 96)
  grad.addColorStop(0, bgColor)
  grad.addColorStop(1, highlighted ? '#332315' : '#1b1b22')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 96, 96)
  ctx.strokeStyle = highlighted ? 'rgba(232,164,74,0.9)' : 'rgba(255,255,255,0.12)'
  ctx.lineWidth = highlighted ? 3 : 2
  ctx.strokeRect(2, 2, 92, 92)
  if (highlighted) {
    ctx.fillStyle = 'rgba(232,164,74,0.16)'
    ctx.fillRect(0, 0, 96, 96)
  }
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '700 38px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = highlighted ? 'rgba(232,164,74,0.5)' : 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = highlighted ? 10 : 6
  ctx.fillText(text, 48, 50)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function setHoveredFace(faceIndex: number | null) {
  if (hoveredFace === faceIndex) return
  hoveredFace = faceIndex
  materials.forEach((material, index) => {
    material.map = faceIndex === index ? hoverTextures[index] : baseTextures[index]
    material.needsUpdate = true
  })
}

onMounted(() => {
  if (!cubeCanvas.value) return
  const size = 94

  cubeRenderer = new THREE.WebGLRenderer({ canvas: cubeCanvas.value, antialias: true, alpha: true })
  cubeRenderer.setSize(size, size)
  cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  cubeScene = new THREE.Scene()
  cubeCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cubeCamera.position.set(0, 0, 4.0)

  cubeMesh = new THREE.Group()
  cubeMesh.position.y = 0.14

  faceLabels.forEach((text, i) => {
    baseTextures.push(makeTextTexture(text, faceColors[i], false))
    hoverTextures.push(makeTextTexture(text, faceColors[i], true))
    materials.push(new THREE.MeshBasicMaterial({ map: baseTextures[i] }))
  })

  cubeBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), materials)
  cubeMesh.add(cubeBox)

  // Medium axis arrows with visible heads
  const axisLength = 0.9
  const headLength = 0.18
  const headWidth = 0.11
  cubeMesh.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), axisLength, 0x8a3030, headLength, headWidth))
  cubeMesh.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), axisLength, 0x3a7a3a, headLength, headWidth))
  cubeMesh.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), axisLength, 0x3a4080, headLength, headWidth))

  const centerDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xf4f4f7, transparent: true, opacity: 0.9 })
  )
  cubeMesh.add(centerDot)

  cubeScene.add(cubeMesh)
  cubeScene.add(new THREE.AmbientLight(0xffffff, 1))

  cubeCanvas.value.addEventListener('mousedown', onMouseDown)
  cubeCanvas.value.addEventListener('click', onCanvasClick)
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
  dragDistance = 0
  lastMouse = { x: e.clientX, y: e.clientY }
}

function onTouchStart(e: TouchEvent) {
  e.preventDefault()
  isDragging.value = true
  dragDistance = 0
  lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function applyDrag(clientX: number, clientY: number) {
  if (!isDragging.value) return
  const dx = clientX - lastMouse.x
  const dy = clientY - lastMouse.y
  dragDistance += Math.hypot(dx, dy)
  lastMouse = { x: clientX, y: clientY }

  try {
    const controls = props.getControls()
    const camera = props.getCamera()
    if (!controls || !camera) return

    const azimuth = controls.getAzimuthalAngle() - dx * 0.015
    const polar = Math.max(controls.minPolarAngle, Math.min(controls.maxPolarAngle, controls.getPolarAngle() - dy * 0.015))
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

function updateHoverFace(clientX: number, clientY: number) {
  if (!cubeCanvas.value || isDragging.value) {
    setHoveredFace(null)
    return
  }

  const rect = cubeCanvas.value.getBoundingClientRect()
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, cubeCamera)

  const hit = raycaster.intersectObject(cubeBox)[0]
  if (!hit || hit.faceIndex === undefined) {
    setHoveredFace(null)
    return
  }

  setHoveredFace(Math.floor(hit.faceIndex / 2))
}

function onCanvasClick(e: MouseEvent) {
  if (dragDistance > 4 || !cubeCanvas.value) return

  const rect = cubeCanvas.value.getBoundingClientRect()
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, cubeCamera)

  const hit = raycaster.intersectObject(cubeBox)[0]
  if (!hit || hit.faceIndex === undefined) return

  const faceIndex = Math.floor(hit.faceIndex / 2)
  const views: Array<'right' | 'left' | 'top' | 'bottom' | 'front' | 'back'> = [
    'right', 'left', 'top', 'bottom', 'front', 'back',
  ]
  props.onSnapView?.(views[faceIndex] ?? 'front')
}

function resetView() {
  props.onResetView?.()
}

function focusObject() {
  props.onFocusObject?.()
}

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
  baseTextures.forEach(texture => texture.dispose())
  hoverTextures.forEach(texture => texture.dispose())
  materials.forEach(material => material.dispose())
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
  cubeCanvas.value?.removeEventListener('click', onCanvasClick)
})
</script>

<template>
  <div
    :style="{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 35,
      borderRadius: '11px',
      overflow: 'hidden',
      background: isHovering ? 'rgba(34, 36, 46, 0.82)' : 'rgba(32, 34, 42, 0.76)',
      border: isHovering ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.06)',
      boxShadow: isHovering ? '0 10px 22px rgba(0,0,0,0.26)' : '0 6px 16px rgba(0,0,0,0.2)',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
      padding: '4px',
      transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      transform: isHovering || isDragging ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
    }"
    @mouseenter="isHovering = true"
    @mouseleave="() => { isHovering = false; setHoveredFace(null) }"
  >
    <canvas
      ref="cubeCanvas"
      width="94"
      height="94"
      :style="{ display: 'block', width: '94px', height: '94px' }"
      @mousemove="updateHoverFace($event.clientX, $event.clientY)"
    />
    <div
      :style="{
        position: 'absolute',
        left: '4px',
        right: '4px',
        bottom: '4px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3px',
      }"
    >
      <button
        @click="resetView"
        title="Reset view"
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '18px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(24,24,30,0.55)',
          color: 'rgba(255,255,255,0.72)',
          cursor: 'pointer',
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }"
      >
        <House :size="10" />
      </button>
      <button
        @click="focusObject"
        title="Focus object"
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '18px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(24,24,30,0.55)',
          color: 'rgba(255,255,255,0.72)',
          cursor: 'pointer',
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }"
      >
        <Focus :size="10" />
      </button>
    </div>
  </div>
</template>
