<script setup lang="ts">
const model = defineModel<boolean>()
defineProps<{ label: string; hint?: string; icon?: any }>()
</script>

<template>
  <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }">
    <div>
      <span :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#c0c0c8' }">
        <component v-if="icon" :is="icon" :size="13" :style="{ color: '#6b6b75' }" />
        {{ label }}
      </span>
      <p v-if="hint" :style="{ fontSize: '11px', color: '#6b6b75', marginTop: '2px', marginLeft: icon ? '19px' : '0' }">{{ hint }}</p>
    </div>
    <button @click="model = !model" class="toggle" :class="{ active: model }" />
  </div>
</template>
