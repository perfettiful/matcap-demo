export function useFlipLabel<T>(
  source: Ref<T | undefined>,
  resolveLabel: (value: T) => string,
  fallbackLabel: string,
) {
  const displayLabel = ref(fallbackLabel)
  const isFlipping = ref(false)
  let labelTimer: ReturnType<typeof setTimeout> | null = null
  let resetTimer: ReturnType<typeof setTimeout> | null = null

  if (source.value !== undefined) {
    displayLabel.value = resolveLabel(source.value)
  }

  watch(source, (newVal) => {
    if (newVal === undefined) return
    isFlipping.value = true

    if (labelTimer) clearTimeout(labelTimer)
    if (resetTimer) clearTimeout(resetTimer)

    labelTimer = setTimeout(() => {
      displayLabel.value = resolveLabel(newVal)
    }, 120)

    resetTimer = setTimeout(() => {
      isFlipping.value = false
      labelTimer = null
      resetTimer = null
    }, 250)
  })

  onUnmounted(() => {
    if (labelTimer) clearTimeout(labelTimer)
    if (resetTimer) clearTimeout(resetTimer)
  })

  return { displayLabel, isFlipping }
}
