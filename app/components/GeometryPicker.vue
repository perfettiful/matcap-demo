<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const model = defineModel<string>()

const geometries = [
  { key: 'Torus Knot', label: 'Torus Knot', icon: 'knot' },
  { key: 'Sphere', label: 'Sphere', icon: 'sphere' },
  { key: 'Torus', label: 'Torus', icon: 'torus' },
  { key: 'Rounded Cube', label: 'Cube', icon: 'cube' },
  { key: 'Shower Head', label: 'Shower Head', icon: 'shower' },
  { key: 'Angle Stop Valve', label: 'Angle Stop', icon: 'valve' },
  { key: 'Tub Spout', label: 'Tub Spout', icon: 'spout' },
  { key: 'Lever Handle', label: 'Lever', icon: 'lever' },
  { key: 'Escutcheon Plate', label: 'Plate', icon: 'plate' },
  { key: 'Towel Ring', label: 'Ring', icon: 'ring' },
  { key: 'Handle', label: 'Handle', icon: 'handle' },
  { key: 'Knob', label: 'Knob', icon: 'knob' },
]

const { displayLabel, isFlipping } = useFlipLabel(
  model,
  value => geometries.find(g => g.key === value)?.label ?? value,
  geometries.find(g => g.key === model.value)?.label ?? 'Torus Knot',
)
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
            <ellipse cx="11.2" cy="14" rx="4.2" ry="6.3" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <ellipse cx="16.8" cy="14" rx="4.2" ry="6.3" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <path d="M11.6 8.8c1.9 1.4 3.3 2.8 4.6 5.2c-1.2 2.3-2.7 3.7-4.6 5.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.6" fill="none" stroke-linecap="round"/>
            <path d="M16.4 8.8c-1.9 1.4-3.3 2.8-4.6 5.2c1.2 2.3 2.7 3.7 4.6 5.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.9"/>
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
          <!-- Shower Head -->
          <template v-if="geo.icon === 'shower'">
            <path d="M8 18c0-4 2-7 6-8.8c3.6-1.6 6.2-1 7.4.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <path d="M16.3 10.1c2.8 0 4.7 1.5 4.7 3.8" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <path d="M18 15.2v2.2M20 15.4v2.4M22 15.2v2.1" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.3" stroke-linecap="round"/>
          </template>
          <!-- Angle Stop Valve -->
          <template v-if="geo.icon === 'valve'">
            <path d="M7 14h9" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.9" stroke-linecap="round"/>
            <path d="M10 14v-5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.9" stroke-linecap="round"/>
            <circle cx="10" cy="16.5" r="2.4" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.5" fill="none"/>
            <path d="M17.5 10.6v6.6" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.6" stroke-linecap="round"/>
          </template>
          <!-- Tub Spout -->
          <template v-if="geo.icon === 'spout'">
            <path d="M7 18h10c2.8 0 4.8-1.6 4.8-4.2V12" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 18V10.5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M19.5 12h2.5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.7" stroke-linecap="round"/>
          </template>
          <!-- Lever Handle -->
          <template v-if="geo.icon === 'lever'">
            <circle cx="10" cy="18" r="2.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.6" fill="none"/>
            <path d="M11.7 16.7L20.5 10.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="2" stroke-linecap="round"/>
            <circle cx="21.2" cy="9.8" r="1.5" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
          </template>
          <!-- Escutcheon Plate -->
          <template v-if="geo.icon === 'plate'">
            <ellipse cx="14" cy="14" rx="9.5" ry="6.8" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.7" fill="none"/>
            <ellipse cx="14" cy="14" rx="4.2" ry="3.1" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.2" fill="none" opacity="0.8"/>
          </template>
          <!-- Towel Ring -->
          <template v-if="geo.icon === 'ring'">
            <circle cx="16" cy="14" r="6.4" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <path d="M7 14c0-1.8.9-3.3 2.6-4.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none" stroke-linecap="round"/>
            <circle cx="6.4" cy="14" r="1.7" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
          </template>
          <!-- Handle -->
          <template v-if="geo.icon === 'handle'">
            <path d="M7 18 Q7 8 14 8 Q21 8 21 18" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="2" fill="none" stroke-linecap="round"/>
            <circle cx="7" cy="19" r="2" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
            <circle cx="21" cy="19" r="2" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
          </template>
          <!-- Knob -->
          <template v-if="geo.icon === 'knob'">
            <circle cx="14" cy="14" r="7.5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" fill="none"/>
            <circle cx="14" cy="14" r="4.2" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.2" fill="none" opacity="0.8"/>
            <path d="M14 14 L18.5 10.5" :stroke="model === geo.key ? '#e8a44a' : '#888'" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="18.5" cy="10.5" r="1.1" :fill="model === geo.key ? '#e8a44a' : '#888'"/>
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
