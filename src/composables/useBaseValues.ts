import { ref } from 'vue'

export function useBaseValues() {
  const bodyHeight = ref(document.body.clientHeight)
  const bodyWidth = ref(document.body.clientWidth)
  const judgeValue = ref(20)
  const homeRefresh = ref(60)
  const loading = ref(false)

  return {
    bodyHeight,
    bodyWidth,
    judgeValue,
    homeRefresh,
    loading,
  }
}
