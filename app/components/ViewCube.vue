<script setup lang="ts">
import * as THREE from 'three'
import { Focus, House } from 'lucide-vue-next'

const props = defineProps<{
  getCamera: () => THREE.PerspectiveCamera
  getControls: () => any
  onResetView?: () => void
  onFocusObject?: () => void
}>()

const cubeCanvas = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
let cubeRenderer: THREE.WebGLRenderer
let cubeScene: THREE.Scene
let cubeCamera: THREE.PerspectiveCamera
let cubeMesh: THREE.Group
let animId: number | null = null
let lastMouse = { x: 0, y: 0 }
const isHovering = ref(false)

function makeTextTexture(text: string, bgColor: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 96
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 96, 96)
  grad.addColorStop(0, bgColor)
  grad.addColorStop(1, '#1b1b22')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 96, 96)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 2
  ctx.strokeRect(2, 2, 92, 92)
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '700 38px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 6
  ctx.fillText(text, 48, 50)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

onMounted(() => {
  if (!cubeCanvas.value) return
  const size = 68

  cubeRenderer = new THREE.WebGLRenderer({ canvas: cubeCanvas.value, antialias: true, alpha: true })
  cubeRenderer.setSize(size, size)
  cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  cubeScene = new THREE.Scene()
  cubeCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  cubeCamera.position.set(0, 0, 4.5)

  cubeMesh = new THREE.Group()

  const labels = ['R', 'L', 'U', 'D', 'F', 'B']
  const colors = ['#a23c3c', '#355f9f', '#4b8a48', '#9a7b36', '#5a5fc0', '#6c4e91']
  const materials = labels.map((text, i) => new THREE.MeshBasicMaterial({ map: makeTextTexture(text, colors[i]) }))

  const box = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), materials)
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

  const centerDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xf4f4f7, transparent: true, opacity: 0.9 })
  )
  cubeMesh.add(centerDot)

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
      borderRadius: '12px',
      overflow: 'hidden',
      background: isHovering ? 'rgba(34, 36, 46, 0.82)' : 'rgba(32, 34, 42, 0.76)',
      border: isHovering ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.06)',
      boxShadow: isHovering ? '0 10px 22px rgba(0,0,0,0.26)' : '0 6px 16px rgba(0,0,0,0.2)',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
      padding: '6px',
      transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      transform: isHovering || isDragging ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
    }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <canvas ref="cubeCanvas" width="68" height="68" :style="{ display: 'block', width: '68px', height: '68px' }" />
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px',
        marginTop: '6px',
      }"
    >
      <button
        @click="resetView"
        title="Reset view"
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '22px',
          borderRadius: '7px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.72)',
          cursor: 'pointer',
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }"
      >
        <House :size="12" />
      </button>
      <button
        @click="focusObject"
        title="Focus object"
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '22px',
          borderRadius: '7px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.72)',
          cursor: 'pointer',
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }"
      >
        <Focus :size="12" />
      </button>
    </div>
  </div>
</template>
