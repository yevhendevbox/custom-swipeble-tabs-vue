import { ref, onMounted, onUnmounted } from 'vue'

export function useBaseValues() {
  const isMobile = ref(/Mobi|Android|iPhone/i.test(navigator.userAgent))

  const bodyHeight = ref(document.body.clientHeight)
  const bodyWidth = ref(document.body.clientWidth)
  const judgeValue = ref(20)
  const homeRefresh = ref(60)
  const loading = ref(false)

  const updateDimensions = () => {
    bodyHeight.value = document.body.clientHeight
    bodyWidth.value = document.body.clientWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateDimensions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  return {
    bodyHeight,
    bodyWidth,
    judgeValue,
    homeRefresh,
    loading,
    isMobile
  }
}
