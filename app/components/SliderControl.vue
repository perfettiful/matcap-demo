<script setup lang="ts">
const model = defineModel<number>()
const props = defineProps<{ label: string; min: number; max: number; step: number; icon?: any }>()

const fillPercent = computed(() => {
  const val = model.value ?? props.min
  return ((val - props.min) / (props.max - props.min)) * 100
})
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
    <input
      v-model.number="model"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      class="slider-input"
      :style="{ '--fill': fillPercent + '%' } as any"
    />
  </div>
</template>

<style scoped>
.slider-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  background: linear-gradient(
    to right,
    rgba(232, 164, 74, 0.7) 0%,
    rgba(232, 164, 74, 0.7) var(--fill),
    rgba(255, 255, 255, 0.08) var(--fill),
    rgba(255, 255, 255, 0.08) 100%
  );
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e8a44a;
  margin-top: -2px;
  box-shadow: 0 0 6px rgba(232, 164, 74, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
  cursor: pointer;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(232, 164, 74, 0.6), 0 1px 4px rgba(0, 0, 0, 0.3);
}

.slider-input::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.08);
}

.slider-input::-moz-range-progress {
  height: 6px;
  border-radius: 3px;
  background: rgba(232, 164, 74, 0.7);
}

.slider-input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e8a44a;
  border: none;
  box-shadow: 0 0 6px rgba(232, 164, 74, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
</style>
