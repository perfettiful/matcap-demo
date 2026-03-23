<script setup lang="ts">
const model = defineModel<string>()
defineProps<{ label: string; options: Record<string, any> }>()

function formatName(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}
</script>

<template>
  <div>
    <label :style="{ display: 'block', fontSize: '12px', color: '#8a8a94', marginBottom: '6px' }">{{ label }}</label>
    <select
      v-model="model"
      :style="{ background: '#44444d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 30px 8px 10px', fontSize: '13px', color: '#e4e4e7', outline: 'none', width: '100%', appearance: 'none', cursor: 'pointer' }"
    >
      <option v-for="(_, key) in options" :key="key" :value="key">{{ formatName(String(key)) }}</option>
    </select>
  </div>
</template>
