<script setup lang="ts">
const model = defineModel<number>()
defineProps<{ label: string; min: number; max: number; step: number; icon?: any }>()
</script>

<template>
  <div>
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }">
      <span :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8a8a94' }">
        <component v-if="icon" :is="icon" :size="12" :style="{ color: '#6b6b75' }" />
        {{ label }}
      </span>
      <span :style="{ fontSize: '12px', fontFamily: 'monospace', color: '#e8a44a' }">{{ model?.toFixed(step < 0.1 ? 2 : 1) }}</span>
    </div>
    <input v-model.number="model" type="range" :min="min" :max="max" :step="step" />
  </div>
</template>
