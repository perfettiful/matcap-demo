<script setup lang="ts">
import { CircleHelp, Sparkles, Palette, Lightbulb, Video, X } from 'lucide-vue-next'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: [] }>()

const panelBg = 'rgba(50, 50, 56, 0.94)'
const divider = '1px solid rgba(255,255,255,0.05)'
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    enter-from-class="-translate-x-full"
    leave-active-class="transition-transform duration-200 ease-in"
    leave-to-class="-translate-x-full"
  >
    <div
      v-show="show"
      :style="{ background: panelBg, backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 40px rgba(0,0,0,0.3)', position: 'fixed', top: '0', left: '0', bottom: '0', width: '300px', overflowY: 'auto', zIndex: 38 }"
    >
      <div :style="{ padding: '18px 20px 14px', borderBottom: divider, display: 'flex', alignItems: 'center', gap: '10px' }">
        <CircleHelp :size="18" :style="{ color: '#e8a44a' }" />
        <h2 :style="{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7', flex: 1 }">What is a Matcap?</h2>
        <button @click="emit('close')" :style="{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a94', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
          <X :size="16" />
        </button>
      </div>

      <div :style="{ padding: '18px 20px' }">
        <p :style="{ fontSize: '13px', color: '#b0b0b8', lineHeight: '1.7', marginBottom: '18px' }">
          <strong :style="{ color: '#e4e4e7' }">Material Capture (Matcap)</strong> is a texture-based
          shading technique that simulates lighting without any scene lights. The entire lighting
          environment is baked into a single spherical texture.
        </p>

        <div :style="{ marginBottom: '18px' }">
          <h3 :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#f0b560', marginBottom: '8px' }">
            <Sparkles :size="13" /> Key Benefit
          </h3>
          <p :style="{ fontSize: '13px', color: '#b0b0b8', lineHeight: '1.7' }">
            Lighting is baked into the texture so <strong :style="{ color: '#e4e4e7' }">no scene lights are needed</strong>.
            Toggle Scene Lights in the panel to prove it - the Matcap stays identical!
          </p>
        </div>

        <div :style="{ marginBottom: '18px' }">
          <h3 :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#f0b560', marginBottom: '8px' }">
            <Palette :size="13" /> Matcap vs PBR
          </h3>
          <p :style="{ fontSize: '13px', color: '#b0b0b8', lineHeight: '1.7' }">
            Enable comparison mode to see a <strong :style="{ color: '#e4e4e7' }">Matcap</strong> and
            <strong :style="{ color: '#e4e4e7' }">PBR</strong> material side by side on the same geometry.
            PBR uses physically-based rendering with real environment reflections.
            Labels appear on the platform to identify each.
          </p>
        </div>

        <div :style="{ marginBottom: '18px' }">
          <h3 :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#f0b560', marginBottom: '8px' }">
            <Lightbulb :size="13" /> Limitations
          </h3>
          <ul :style="{ fontSize: '13px', color: '#b0b0b8', paddingLeft: '18px', lineHeight: '1.8' }">
            <li>Doesn't respond to scene lights</li>
            <li>No real-time reflections</li>
            <li>Less effective on flat geometry</li>
            <li>View-dependent (rotates with camera)</li>
          </ul>
        </div>

        <div :style="{ borderTop: divider, paddingTop: '16px' }">
          <h3 :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#f0b560', marginBottom: '8px' }">
            <Video :size="13" /> Controls
          </h3>
          <ul :style="{ fontSize: '13px', color: '#6b6b75', lineHeight: '2', listStyle: 'none', padding: '0' }">
            <li :style="{ display: 'flex', gap: '8px' }"><span :style="{ color: '#b0b0b8', fontWeight: 500, minWidth: '80px' }">Left drag</span> Rotate view</li>
            <li :style="{ display: 'flex', gap: '8px' }"><span :style="{ color: '#b0b0b8', fontWeight: 500, minWidth: '80px' }">Scroll</span> Zoom in/out</li>
            <li :style="{ display: 'flex', gap: '8px' }"><span :style="{ color: '#b0b0b8', fontWeight: 500, minWidth: '80px' }">Right drag</span> Pan camera</li>
          </ul>
        </div>
      </div>
    </div>
  </Transition>
</template>
