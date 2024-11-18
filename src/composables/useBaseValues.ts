import { ref, onMounted, onUnmounted } from 'vue'

const verticalScrollIsBlocked = ref(false)
const isMobile = ref(/Mobi|Android|iPhone/i.test(navigator.userAgent))

export function useBaseValues() {
  const bodyHeight = ref(document.body.clientHeight)
  const bodyWidth = ref(document.body.clientWidth)
  const judgeValue = ref(20)
  const homeRefresh = ref(60)
  const loading = ref(false)

  function updateDimensions() {
    bodyHeight.value = document.body.clientHeight
    bodyWidth.value = document.body.clientWidth
  }

  function updateDeviceSource() {
    isMobile.value = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  }

  function toggleVerticalScroll() {
    verticalScrollIsBlocked.value = !verticalScrollIsBlocked.value
  }

  function handleResize() {
    updateDimensions()
    updateDeviceSource()
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    bodyHeight,
    bodyWidth,
    judgeValue,
    homeRefresh,
    loading,
    isMobile,
    toggleVerticalScroll,
    verticalScrollIsBlocked
  }
}
