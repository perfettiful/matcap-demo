<script setup lang="ts">
import { ENVIRONMENTS, type EnvPreset } from '~/types/scene'

const model = defineModel<string>()
const props = defineProps<{
  isLightsOn?: boolean
}>()

const { displayLabel, isFlipping } = useFlipLabel(
  model,
  value => value,
  model.value ?? 'Studio',
)

function tileBackground(env: EnvPreset): string {
  if (env.type === 'solid') {
    return env.color
  }
  const stops = env.stops.map(s => `${s.color} ${s.pos * 100}%`).join(', ')
  return `linear-gradient(to bottom, ${stops})`
}

function isSky(key: string) {
  return key === 'Sky'
}

function skyTileBackground() {
  if (props.isLightsOn === false) {
    return 'linear-gradient(to bottom, #08111f 0%, #10233f 34%, #21395a 72%, #41536e 100%)'
  }
  return 'linear-gradient(to bottom, #5b8fbf 0%, #7badd4 30%, #a8cce4 58%, #d4e4ef 80%, #eef5fa 100%)'
}
</script>

<template>
  <div>
    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }">
      <button
        v-for="(env, key) in ENVIRONMENTS"
        :key="key"
        @click="model = String(key)"
        :style="{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          height: '38px',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          overflow: 'hidden',
          border: model === String(key)
            ? '2px solid rgba(232, 164, 74, 0.5)'
            : '2px solid rgba(255, 255, 255, 0.06)',
          boxShadow: model === String(key)
            ? '0 0 8px rgba(232, 164, 74, 0.2)'
            : 'none',
          transform: model === String(key) ? 'scale(1.03)' : 'scale(1)',
          padding: '0',
        }"
        :title="String(key)"
      >
        <!-- Gradient/solid background fill -->
        <div :style="{
          position: 'absolute',
          inset: 0,
          background: isSky(String(key)) ? skyTileBackground() : tileBackground(env),
          borderRadius: '8px',
        }" />

        <template v-if="isSky(String(key)) && props.isLightsOn !== false">
          <div :style="{ position: 'absolute', top: '9px', left: '10px', width: '24px', height: '8px', background: 'rgba(255,255,255,0.45)', borderRadius: '999px', filter: 'blur(1.2px)' }" />
          <div :style="{ position: 'absolute', top: '6px', left: '16px', width: '13px', height: '9px', background: 'rgba(255,255,255,0.6)', borderRadius: '999px', filter: 'blur(0.8px)' }" />
          <div :style="{ position: 'absolute', top: '9px', left: '22px', width: '11px', height: '7px', background: 'rgba(255,255,255,0.55)', borderRadius: '999px', filter: 'blur(0.8px)' }" />
          <div :style="{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '7px', background: 'rgba(255,255,255,0.42)', borderRadius: '999px', filter: 'blur(1px)' }" />
          <div :style="{ position: 'absolute', top: '7px', right: '15px', width: '10px', height: '7px', background: 'rgba(255,255,255,0.56)', borderRadius: '999px', filter: 'blur(0.8px)' }" />
        </template>

        <template v-if="isSky(String(key)) && props.isLightsOn === false">
          <div :style="{ position: 'absolute', top: '7px', left: '11px', width: '2px', height: '2px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', boxShadow: '18px 4px 0 rgba(255,255,255,0.7), 38px 1px 0 rgba(255,255,255,0.85), 51px 8px 0 rgba(255,255,255,0.55)' }" />
          <div :style="{ position: 'absolute', top: '14px', left: '28px', width: '2px', height: '2px', background: 'rgba(255,255,255,0.65)', borderRadius: '50%', boxShadow: '14px 6px 0 rgba(255,255,255,0.75), 31px -3px 0 rgba(255,255,255,0.45)' }" />
          <div :style="{ position: 'absolute', top: '6px', right: '13px', width: '7px', height: '7px', background: 'rgba(255,248,220,0.8)', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,248,220,0.25)' }" />
        </template>

        <!-- Ground strip at the bottom -->
        <div :style="{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isSky(String(key)) ? '15px' : '13px',
          background: isSky(String(key)) && props.isLightsOn === false ? '#2d3647' : env.ground,
          borderRadius: '0 0 8px 8px',
        }" />

        <!-- Name overlay -->
        <span :style="{
          position: 'relative',
          zIndex: 1,
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: model === String(key) ? '#e8a44a' : 'rgba(255,255,255,0.45)',
          paddingBottom: isSky(String(key)) ? '2px' : '3px',
          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
        }">
          {{ key }}
        </span>
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
