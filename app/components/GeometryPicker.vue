<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const model = defineModel<string>()

const geometries = [
  { key: 'Torus Knot', label: 'Torus Knot', icon: 'knot' },
  { key: 'Sphere', label: 'Sphere', icon: 'sphere' },
  { key: 'Torus', label: 'Torus', icon: 'torus' },
  { key: 'Rounded Cube', label: 'Cube', icon: 'cube' },
  { key: 'Capsule', label: 'Capsule', icon: 'capsule' },
  { key: 'Cylinder', label: 'Cylinder', icon: 'cylinder' },
  { key: 'Handle', label: 'Handle', icon: 'handle' },
  { key: 'Knob', label: 'Knob', icon: 'knob' },
]

const displayLabel = ref(geometries.find(g => g.key === model.value)?.label ?? 'Torus Knot')
const isFlipping = ref(false)

watch(model, (newVal) => {
  if (!newVal) return
  isFlipping.value = true
  setTimeout(() => {
    displayLabel.value = geometries.find(g => g.key === newVal)?.label ?? newVal
  }, 120)
  setTimeout(() => { isFlipping.value = false }, 250)
})
</script>

<template>
  <div>
    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }">
      <button
        v-for="geo in geometries"
        :key="geo.key"
        @click="model = geo.key"
        :style="{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '42px',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          background: model === geo.key ? 'rgba(232, 164, 74, 0.12)' : 'rgba(255, 255, 255, 0.03)',
          border: model === geo.key ? '2px solid rgba(232, 164, 74, 0.5)' : '2px solid transparent',
          boxShadow: model === geo.key ? '0 0 8px rgba(232, 164, 74, 0.2)' : 'none',
          transform: model === geo.key ? 'scale(1.05)' : 'scale(1)',
        }"
        :title="geo.label"
      >
        <!-- SVG shape icons -->
        <svg width="34" height="34" viewBox="0 0 28 28" fill="none" :style="{ opacity: model === geo.key ? 1 : 0.5 }">
          <!-- Torus Knot -->
          <template v-if="geo.icon === 'knot'">
            <path d="M14 4c-3 0-5 2-6 5s0 6 2 8c2 1 5 2 7 0s3-5 2-8c-1-2-3-5-5-5z" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <path d="M10 10c1-2 4-3 6-2s3 3 2 5-3 4-5 3-3-2-3-4" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          </template>
          <!-- Sphere -->
          <template v-if="geo.icon === 'sphere'">
            <circle cx="14" cy="14" r="9" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <ellipse cx="14" cy="14" rx="9" ry="3.5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1" fill="none" opacity="0.5"/>
            <ellipse cx="14" cy="14" rx="3.5" ry="9" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1" fill="none" opacity="0.5"/>
          </template>
          <!-- Torus -->
          <template v-if="geo.icon === 'torus'">
            <ellipse cx="14" cy="14" rx="10" ry="5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <ellipse cx="14" cy="14" rx="4" ry="2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.5" fill="none"/>
          </template>
          <!-- Rounded Cube -->
          <template v-if="geo.icon === 'cube'">
            <rect x="5" y="5" width="18" height="18" rx="4" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <line x1="5" y1="10" x2="23" y2="10" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="0.8" opacity="0.3"/>
            <line x1="10" y1="5" x2="10" y2="23" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="0.8" opacity="0.3"/>
          </template>
          <!-- Capsule -->
          <template v-if="geo.icon === 'capsule'">
            <rect x="9" y="4" width="10" height="20" rx="5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
          </template>
          <!-- Cylinder -->
          <template v-if="geo.icon === 'cylinder'">
            <ellipse cx="14" cy="7" rx="7" ry="3" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <line x1="7" y1="7" x2="7" y2="21" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8"/>
            <line x1="21" y1="7" x2="21" y2="21" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8"/>
            <path d="M7 21 Q14 27 21 21" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
          </template>
          <!-- Handle -->
          <template v-if="geo.icon === 'handle'">
            <path d="M7 18 Q7 8 14 8 Q21 8 21 18" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="7" cy="19" r="2" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
            <circle cx="21" cy="19" r="2" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
          </template>
          <!-- Knob -->
          <template v-if="geo.icon === 'knob'">
            <path d="M10 22 Q8 22 8 16 Q8 8 14 6 Q20 8 20 16 Q20 22 18 22 Z" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
            <ellipse cx="14" cy="22" rx="4" ry="1.5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.2" fill="none"/>
          </template>
        </svg>
      </button>
    </div>

    <!-- Label with odometer flip -->
    <div :style="{ marginTop: '10px', textAlign: 'center', height: '16px', overflow: 'hidden', perspective: '60px' }">
      <div
        :style="{
          fontSize: '11px',
          color: '#8a8a94',
          lineHeight: '16px',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
          transformOrigin: 'center bottom',
          transform: isFlipping ? 'rotateX(90deg)' : 'rotateX(0deg)',
          opacity: isFlipping ? 0 : 1,
        }"
      >
        {{ displayLabel }}
      </div>
    </div>
  </div>
</template>
