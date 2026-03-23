<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  icon: any
  open: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <section>
    <button
      @click="emit('toggle')"
      :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 18px', background: 'none', border: 'none', cursor: 'pointer', color: '#e8a44a', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', gap: '8px' }"
    >
      <span :style="{ display: 'flex', alignItems: 'center', gap: '8px' }">
        <component :is="icon" :size="14" />
        {{ title }}
      </span>
      <ChevronDown :size="14" :style="{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }" />
    </button>
    <div v-show="open" :style="{ padding: '2px 18px 14px' }">
      <slot />
    </div>
  </section>
  <div :style="{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 18px' }" />
</template>
