<script setup lang="ts">
import { MATCAPS, MATCAP_LABELS } from '~/types/scene'
import { Check } from 'lucide-vue-next'

const model = defineModel<string>()
const { displayLabel, isFlipping } = useFlipLabel(
  model,
  value => MATCAP_LABELS[value] ?? value,
  MATCAP_LABELS[model.value ?? 'steel'] ?? 'Steel',
)

/** Convert a hex number (0xRRGGBB) to a CSS hex string */
function hexColor(n: number): string {
  return '#' + n.toString(16).padStart(6, '0')
}

/** Lighter shade for the glow ring on dark colors */
function glowColor(n: number): string {
  const r = Math.min(255, ((n >> 16) & 0xff) + 60)
  const g = Math.min(255, ((n >> 8) & 0xff) + 60)
  const b = Math.min(255, (n & 0xff) + 60)
  return `rgba(${r}, ${g}, ${b}, 0.5)`
}

function isDark(n: number): boolean {
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  return (r * 0.299 + g * 0.587 + b * 0.114) < 100
}
</script>

<template>
  <div>
    <div class="grid grid-cols-7 gap-1.5">
      <button
        v-for="(entry, key) in MATCAPS"
        :key="key"
        @click="model = String(key)"
        class="group relative flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150"
        :style="{
          width: '100%',
          aspectRatio: '1',
          background: `radial-gradient(circle at 35% 35%, ${hexColor(Math.min(0xffffff, entry.color + 0x303030))}, ${hexColor(entry.color)}, ${hexColor(Math.max(0, entry.color - 0x202020))})`,
          border: model === String(key)
            ? `2px solid ${hexColor(entry.color === 0x1a1a1a ? 0x888888 : entry.color)}`
            : '2px solid transparent',
          boxShadow: model === String(key)
            ? `0 0 8px ${glowColor(entry.color)}`
            : 'inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -1px 2px rgba(0,0,0,0.2)',
          transform: model === String(key) ? 'scale(1.1)' : 'scale(1)',
        }"
        :title="MATCAP_LABELS[String(key)]"
      >
        <!-- Selected check -->
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-50"
        >
          <Check
            v-if="model === String(key)"
            :size="11"
            :style="{ color: isDark(entry.color) ? '#ccc' : '#222', strokeWidth: 3 }"
            class="drop-shadow-sm"
          />
        </Transition>
      </button>
    </div>

    <!-- Current selection label with odometer flip -->
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
