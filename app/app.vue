<script setup lang="ts">
import {
  Palette, Box, Sun, Moon, RotateCw, GitCompare, Video,
  PanelRightClose, PanelRightOpen,
  ZoomIn, Minus, RotateCcw, Eye, Lightbulb,
  Layers, CircleHelp, Sparkles, Gauge, Github,
} from 'lucide-vue-next'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { settings, init, dispose, zoomIn, zoomOut, resetView, focusObject, getCamera, getControls, MATCAPS, GEOMETRIES, ENVIRONMENTS } = useMatcapScene()
const showInfo = ref(false)
const showControls = ref(false)
const showLightTooltip = ref(false)
const showGithubTooltip = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null
let panelRevealTimer: ReturnType<typeof setTimeout> | null = null

const sections = reactive({
  material: true, geometry: true, environment: true,
  lighting: true, animation: true, comparison: true, camera: true,
})

function toggleLights() {
  settings.showLights = !settings.showLights
  showLightTooltip.value = true
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  tooltipTimeout = setTimeout(() => { showLightTooltip.value = false }, 2000)
}

const lightTooltipText = computed(() =>
  settings.showLights ?  'Lights out!' : 'Let there be Light!'
)

// Canvas cursor states
const isDragging = ref(false)
const isZooming = ref(false)
const zoomCursor = ref<'zoom-in' | 'zoom-out'>('zoom-in')
let zoomTimer: ReturnType<typeof setTimeout> | null = null

const canvasCursor = computed(() => {
  if (isDragging.value) return 'grabbing'
  if (isZooming.value) return zoomCursor.value
  return 'grab'
})

function onCanvasDown() { isDragging.value = true }
function onCanvasUp() { isDragging.value = false }

onMounted(() => {
  if (canvasRef.value) init(canvasRef.value)

  // Start focused on the scene, then reveal controls once the user has oriented.
  panelRevealTimer = setTimeout(() => {
    showControls.value = true
  }, 1400)

  // Detect scroll-zoom on canvas
  canvasRef.value?.addEventListener('wheel', (event) => {
    zoomCursor.value = event.deltaY > 0 ? 'zoom-out' : 'zoom-in'
    isZooming.value = true
    if (zoomTimer) clearTimeout(zoomTimer)
    zoomTimer = setTimeout(() => { isZooming.value = false }, 300)
  }, { passive: true })
})
onUnmounted(() => {
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  if (zoomTimer) clearTimeout(zoomTimer)
  if (panelRevealTimer) clearTimeout(panelRevealTimer)
  dispose()
})

const panelBg = 'rgba(50, 50, 56, 0.94)'
const panelBlur = 'blur(24px)'
const panelBorder = '1px solid rgba(255,255,255,0.1)'
const panelShadow = '0 0 40px rgba(0,0,0,0.3)'
const btnCss = { background: '#44444d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 0', fontSize: '12px', color: '#c0c0c8', cursor: 'pointer', textAlign: 'center' as const, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden" style="background: #2e2e34">
    <canvas
      ref="canvasRef"
      class="block w-full h-full"
      :style="{ cursor: canvasCursor }"
      @mousedown="onCanvasDown"
      @mouseup="onCanvasUp"
      @mouseleave="onCanvasUp"
    />

    <ViewCube :get-camera="getCamera" :get-controls="getControls" :on-reset-view="resetView" :on-focus-object="focusObject" />

    <!-- Toggle button -->
    <button
      @click="showControls = !showControls"
      :style="{ background: panelBg, backdropFilter: panelBlur, border: panelBorder, borderRadius: '10px', padding: '0', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: '16px', zIndex: 50, right: showControls ? '316px' : '16px', transition: 'right 0.3s ease', cursor: 'pointer', color: '#8a8a94', boxShadow: panelShadow }"
    >
      <component :is="showControls ? PanelRightClose : PanelRightOpen" :size="16" />
    </button>

    <!-- Control Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-to-class="translate-x-full"
    >
      <aside
        v-show="showControls"
        :style="{ background: panelBg, backdropFilter: panelBlur, borderLeft: panelBorder, boxShadow: panelShadow, position: 'fixed', top: 0, right: 0, bottom: 0, width: '308px', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 40 }"
      >
        <div :style="{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }">
          <Sparkles :size="18" :style="{ color: '#e8a44a' }" />
          <div>
            <h1 :style="{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7' }">Matcap Explorer</h1>
            <p :style="{ fontSize: '11px', color: '#6b6b75', marginTop: '2px' }">Material capture demo</p>
          </div>
        </div>

        <div :style="{ flex: 1, overflowY: 'auto', padding: '4px 0' }">
          <PanelSection title="Material" :icon="Palette" :open="sections.material" @toggle="sections.material = !sections.material">
            <MatcapPicker v-model="settings.matcap" />
          </PanelSection>

          <PanelSection title="Geometry" :icon="Box" :open="sections.geometry" @toggle="sections.geometry = !sections.geometry">
            <GeometryPicker v-model="settings.geometry" />
          </PanelSection>

          <PanelSection title="Environment" :icon="Layers" :open="sections.environment" @toggle="sections.environment = !sections.environment">
            <EnvironmentPicker v-model="settings.environment" :is-lights-on="settings.showLights" />
            <div :style="{ marginTop: '8px' }">
              <ToggleRow v-model="settings.showPlatform" label="Show Platform" :icon="Eye" />
            </div>
          </PanelSection>

          <PanelSection title="Lighting" :icon="Lightbulb" :open="sections.lighting" @toggle="sections.lighting = !sections.lighting">
            <ToggleRow v-model="settings.showLights" label="Scene Lights" hint="Matcap ignores these!" :icon="Sun" />
          </PanelSection>

          <PanelSection title="Animation" :icon="RotateCw" :open="sections.animation" @toggle="sections.animation = !sections.animation">
            <ToggleRow v-model="settings.autoRotate" label="Auto Rotate" />
            <SliderControl v-if="settings.autoRotate" v-model="settings.rotationSpeed" label="Speed" :min="0.1" :max="2" :step="0.1" :icon="Gauge" />
          </PanelSection>

          <PanelSection title="PBR Comparison" :icon="GitCompare" :open="sections.comparison" @toggle="sections.comparison = !sections.comparison">
            <ToggleRow v-model="settings.comparisonMode" label="Side by Side" hint="Matcap vs PBR material" />
            <template v-if="settings.comparisonMode">
              <SliderControl v-model="settings.pbrMetalness" label="Metalness" :min="0" :max="1" :step="0.01" />
              <SliderControl v-model="settings.pbrRoughness" label="Roughness" :min="0" :max="1" :step="0.01" />
            </template>
          </PanelSection>

          <PanelSection title="Camera" :icon="Video" :open="sections.camera" @toggle="sections.camera = !sections.camera">
            <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }">
              <button @click="zoomIn" :style="btnCss"><ZoomIn :size="13" /> In</button>
              <button @click="zoomOut" :style="btnCss"><Minus :size="13" /> Out</button>
            </div>
            <button @click="resetView" :style="{ ...btnCss, marginTop: '6px' }"><RotateCcw :size="13" /> Reset View</button>
          </PanelSection>
        </div>
      </aside>
    </Transition>

    <!-- Info Button -->
    <button
      @click="showInfo = !showInfo"
      :style="{ background: panelBg, backdropFilter: panelBlur, border: panelBorder, borderRadius: '10px', boxShadow: panelShadow, padding: '0', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', bottom: '16px', left: '16px', zIndex: 40, cursor: 'pointer', color: showInfo ? '#e8a44a' : '#8a8a94' }"
    >
      <CircleHelp :size="16" />
    </button>

    <!-- Bottom center controls -->
    <div class="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full px-1.5 py-1"
      :style="{ background: 'rgba(30, 30, 36, 0.75)', backdropFilter: panelBlur, border: '1px solid rgba(255,255,255,0.08)' }"
    >
      <!-- Sun/Moon Light Toggle -->
      <div class="relative"
        @mouseenter="showLightTooltip = true"
        @mouseleave="showLightTooltip = false"
      >
        <button
          @click="toggleLights"
          class="relative flex items-center justify-center w-7 h-7 rounded-full cursor-pointer transition-all duration-300"
          :style="{
            background: settings.showLights
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : 'linear-gradient(135deg, #334155, #1e293b)',
            boxShadow: settings.showLights
              ? '0 0 10px rgba(251, 191, 36, 0.35)'
              : 'none',
          }"
        >
          <Transition
            enter-active-class="transition-all duration-400 ease-out"
            enter-from-class="opacity-0 rotate-[-90deg] scale-50"
            enter-to-class="opacity-100 rotate-0 scale-100"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 rotate-0 scale-100"
            leave-to-class="opacity-0 rotate-90 scale-50"
          >
            <Sun v-if="settings.showLights" :size="13" class="absolute text-white" />
          </Transition>
          <Transition
            enter-active-class="transition-all duration-400 ease-out"
            enter-from-class="opacity-0 rotate-90 scale-50"
            enter-to-class="opacity-100 rotate-0 scale-100"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 rotate-0 scale-100"
            leave-to-class="opacity-0 rotate-[-90deg] scale-50"
          >
            <Moon v-if="!settings.showLights" :size="13" class="absolute text-slate-400" />
          </Transition>
        </button>

        <!-- Light tooltip -->
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showLightTooltip"
            :style="{
              position: 'absolute',
              bottom: 'calc(100% + 12px)',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              background: 'rgba(20, 20, 26, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#b0b0bc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }"
          >
            {{ lightTooltipText }}
            <!-- arrow with matching border -->
            <div :style="{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              background: 'rgba(20, 20, 26, 0.95)',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }" />
          </div>
        </Transition>
      </div>

      <!-- Divider -->
      <div class="w-px h-4" style="background: rgba(255,255,255,0.1)" />

      <!-- GitHub link -->
      <div class="relative"
        @mouseenter="showGithubTooltip = true"
        @mouseleave="showGithubTooltip = false"
      >
        <a
          href="https://github.com/perfettiful/matcap-demo"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200"
          style="color: #6b6b78"
          @mouseenter="($event.currentTarget as HTMLElement).style.color = '#b0b0bc'"
          @mouseleave="($event.currentTarget as HTMLElement).style.color = '#6b6b78'"
        >
          <Github :size="13" />
        </a>

        <!-- GitHub tooltip -->
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="showGithubTooltip"
            :style="{
              position: 'absolute',
              bottom: 'calc(100% + 12px)',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              background: 'rgba(20, 20, 26, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#b0b0bc',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }"
          >
            View Source
            <!-- arrow with matching border -->
            <div :style="{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              background: 'rgba(20, 20, 26, 0.95)',
              borderRight: '1px solid rgba(255,255,255,0.1)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }" />
          </div>
        </Transition>
      </div>
    </div>

    <InfoPanel :show="showInfo" @close="showInfo = false" />
  </div>
</template>
