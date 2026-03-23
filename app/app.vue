<script setup lang="ts">
import {
  Palette, Box, Sun, RotateCw, GitCompare, Video,
  PanelRightClose, PanelRightOpen,
  ZoomIn, ZoomOut, RotateCcw, Eye, Lightbulb,
  Layers, CircleHelp, Sparkles, Gauge,
} from 'lucide-vue-next'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { settings, init, dispose, zoomIn, zoomOut, resetView, getCamera, getControls, MATCAPS, GEOMETRIES, ENVIRONMENTS } = useMatcapScene()
const showInfo = ref(false)
const showControls = ref(true)

const sections = reactive({
  material: true, geometry: true, environment: true,
  lighting: true, animation: true, comparison: false, camera: true,
})

onMounted(() => { if (canvasRef.value) init(canvasRef.value) })
onUnmounted(() => dispose())

const panelBg = 'rgba(50, 50, 56, 0.94)'
const panelBlur = 'blur(24px)'
const panelBorder = '1px solid rgba(255,255,255,0.1)'
const panelShadow = '0 0 40px rgba(0,0,0,0.3)'
const btnCss = { background: '#44444d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 0', fontSize: '12px', color: '#c0c0c8', cursor: 'pointer', textAlign: 'center' as const, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden" style="background: #2e2e34">
    <canvas ref="canvasRef" class="block w-full h-full" />

    <ViewCube :get-camera="getCamera" :get-controls="getControls" />

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
            <SelectControl v-model="settings.matcap" label="Matcap" :options="MATCAPS" />
          </PanelSection>

          <PanelSection title="Geometry" :icon="Box" :open="sections.geometry" @toggle="sections.geometry = !sections.geometry">
            <SelectControl v-model="settings.geometry" label="Shape" :options="GEOMETRIES" />
          </PanelSection>

          <PanelSection title="Environment" :icon="Layers" :open="sections.environment" @toggle="sections.environment = !sections.environment">
            <SelectControl v-model="settings.environment" label="Background" :options="ENVIRONMENTS" />
            <ToggleRow v-model="settings.showPlatform" label="Show Platform" :icon="Eye" />
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
              <button @click="zoomOut" :style="btnCss"><ZoomOut :size="13" /> Out</button>
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

    <InfoPanel :show="showInfo" @close="showInfo = false" />
  </div>
</template>
