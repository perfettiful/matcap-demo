<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  title: string
  icon: any
  open: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

function onBeforeEnter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = '0'
  htmlEl.style.opacity = '0'
}

function onEnter(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  // Read the natural height
  htmlEl.style.height = 'auto'
  const h = htmlEl.scrollHeight
  htmlEl.style.height = '0'
  // Force reflow
  void htmlEl.offsetHeight
  htmlEl.style.transition = 'height 0.25s ease, opacity 0.2s ease 0.05s'
  htmlEl.style.height = h + 'px'
  htmlEl.style.opacity = '1'
  htmlEl.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'height') {
      htmlEl.style.height = 'auto'
      htmlEl.removeEventListener('transitionend', handler)
      done()
    }
  })
}

function onLeave(el: Element, done: () => void) {
  const htmlEl = el as HTMLElement
  const h = htmlEl.scrollHeight
  htmlEl.style.height = h + 'px'
  htmlEl.style.opacity = '1'
  // Force reflow
  void htmlEl.offsetHeight
  htmlEl.style.transition = 'height 0.2s ease, opacity 0.15s ease'
  htmlEl.style.height = '0'
  htmlEl.style.opacity = '0'
  htmlEl.addEventListener('transitionend', function handler(e) {
    if (e.propertyName === 'height') {
      htmlEl.removeEventListener('transitionend', handler)
      done()
    }
  })
}
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
      <ChevronDown :size="14" :style="{ transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'none' }" />
    </button>
    <Transition
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
    >
      <div v-if="open" style="overflow: hidden;">
        <div :style="{ padding: '2px 18px 14px' }">
          <slot />
        </div>
      </div>
    </Transition>
  </section>
  <div :style="{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 18px' }" />
</template>
