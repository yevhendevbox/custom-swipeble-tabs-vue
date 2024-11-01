<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  useAttrs,
  getCurrentInstance,
  type ComponentInternalInstance,
} from 'vue'
import bus from '@/utils/bus'
import { _css } from '@/utils/dom'
import { _stopPropagation } from '@/utils/stopPropagation'

const props = defineProps({
  canMove: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
  indicatorType: {
    type: String,
    default: '',
  },
  useHomeLoading: {
    type: Boolean,
    default: false,
  },
  activeIndex: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
    default: '',
  },
})
const emits = defineEmits<{
  'update:active-index': [number]
}>()

const isHome = computed(() => props.indicatorType === 'home')
const attrs = useAttrs()

// Reactive data properties
const loading = ref(false)

const wrapperWidth = ref<string | number | null | undefined>(0)
const wrapperHeight = ref<string | number | null | undefined>(0)
const tabWidth = ref<string | number | null | undefined>(0)

const startLocationX = ref(0)
const startLocationY = ref(0)

const moveXDistance = ref(0)
const moveYDistance = ref(0)

const judgeValue = ref(10)
const startTime = ref(0)

const currentSlideItemIndex = ref(0)

const isDrawRight = ref(true)
const isDrawDown = ref(true)

const isCanRightWiping = ref(false)
const isCanDownWiping = ref(false)

const isNeedCheck = ref(true)

const slideList = ref<HTMLElement | null>(null)
const slideItems = ref<HTMLCollection | []>([])
const indicatorRef = ref<HTMLElement | null | unknown>(null)
const slideItemsWidths = ref<Array<string | number | null | undefined>>([])

const tabIndicatorRelationActiveIndexLefts = ref([])
const indicatorSpace = ref(0)
const toolbarStyleTransitionDuration = ref(0)
const homeLoadingMoveYDistance = ref(0)

const bodyWidth = document.body.clientWidth

// Watchers
watch(
  () => props.activeIndex,
  () => {
    changeIndex()
  },
)

// Lifecycle hooks
onMounted(async () => {
  await checkChildren()
  if (isHome.value) initTabs()
  changeIndex(true)

  if (props.autoplay) {
    setInterval(() => {
      if (currentSlideItemIndex.value === slideItems.value.length - 1) {
        currentSlideItemIndex.value = 0
      } else {
        currentSlideItemIndex.value++
      }
      changeIndex(false, currentSlideItemIndex.value)
    }, 3000)
  }
})

function getData() {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 1500)
}
// Methods
function changeIndex(init = false, index: number | null = null) {
  currentSlideItemIndex.value = index !== null ? index : props.activeIndex
  if (!slideList.value) return

  if (!init) _css(slideList.value, 'transition-duration', `300ms`)
  _css(
    slideList.value,
    'transform',
    `translate3d(${
      -getWidth(currentSlideItemIndex.value) + moveXDistance.value
    }px, 0px, 0px)`,
  )

  if (!indicatorRef.value) return

  if (isHome.value) {
    _css(
      indicatorRef.value,
      'left',
      tabIndicatorRelationActiveIndexLefts.value[currentSlideItemIndex.value] +
        'px',
    )
  }
  if (attrs['onUpdate:activeIndex']) {
    emits('update:active-index', currentSlideItemIndex.value)
  }
}

function initTabs() {
  const instance: ComponentInternalInstance | null = getCurrentInstance()

  if (instance && instance.proxy) {
    const tabs = instance.proxy.$refs.tabs
    indicatorRef.value = instance?.proxy.$refs.indicator

    for (let i = 0; i < tabs.children.length; i++) {
      const item = tabs.children[i]
      tabWidth.value = _css(item, 'width')

      tabIndicatorRelationActiveIndexLefts.value.push(
        item.getBoundingClientRect().x -
          tabs.children[0].getBoundingClientRect().x +
          (isHome.value ? tabWidth.value * 0.15 : 0),
      )
    }
    indicatorSpace.value =
      tabIndicatorRelationActiveIndexLefts.value[1] -
      tabIndicatorRelationActiveIndexLefts.value[0]

    if (indicatorRef.value) {
      if (isHome.value) {
        _css(indicatorRef.value, 'transition-duration', `300ms`)
        _css(
          indicatorRef.value,
          'left',
          tabIndicatorRelationActiveIndexLefts.value[
            currentSlideItemIndex.value
          ] + 'px',
        )
      }
    }
  }
}

async function checkChildren() {
  // slideList.value = refs.slideList
  if (slideList.value) {
    slideItems.value = slideList.value.children
    wrapperWidth.value = _css(slideList.value, 'width')
    wrapperHeight.value = _css(slideList.value, 'height')
    for (let i = 0; i < slideItems.value.length; i++) {
      // eslint-disable-next-line
      let el = slideItems.value[i]
      slideItemsWidths.value.push(_css(el as HTMLElement, 'width'))
    }
  }
}

function touchStart(e: TouchEvent) {
  if (!slideList.value) return
  if (!indicatorRef.value) return

  _css(slideList.value, 'transition-duration', `0ms`)
  if (isHome.value) _css(indicatorRef.value, 'transition-duration', `0ms`)
  toolbarStyleTransitionDuration.value = 0

  startLocationX.value = e.touches[0].pageX
  startLocationY.value = e.touches[0].pageY
  startTime.value = Date.now()
}

function touchMove(e: TouchEvent) {
  if (!props.canMove) return
  moveXDistance.value = e.touches[0].pageX - startLocationX.value
  moveYDistance.value = e.touches[0].pageY - startLocationY.value

  isDrawRight.value = moveXDistance.value < 0
  isDrawDown.value = moveYDistance.value < 0

  checkDirection()

  if (isCanDownWiping.value && isHome.value && !loading.value) {
    homeLoadingMoveYDistance.value =
      moveYDistance.value > 0 ? moveYDistance.value : 0
  }

  if (isCanRightWiping.value) {
    if (currentSlideItemIndex.value === 0 && !isDrawRight.value) return
    if (
      currentSlideItemIndex.value === slideItems.value.length - 1 &&
      isDrawRight.value
    )
      return

    bus.emit(props.name + '-moved', {
      x: { distance: moveXDistance.value, isDrawRight: isDrawRight.value },
    })

    _stopPropagation(e)

    if (!slideList.value) return
    if (!indicatorRef.value) return

    _css(
      slideList.value,
      'transform',
      `translate3d(${
        -getWidth(currentSlideItemIndex.value) +
        moveXDistance.value +
        (isDrawRight.value ? judgeValue.value : -judgeValue.value)
      }px, 0px, 0px)`,
    )

    if (isHome.value) {
      _css(
        indicatorRef.value,
        'left',
        tabIndicatorRelationActiveIndexLefts.value[
          currentSlideItemIndex.value
        ] -
          moveXDistance.value / (bodyWidth / indicatorSpace.value) +
          'px',
      )
    }
  }
}

function touchEnd(e: TouchEvent) {
  if (isHome.value) {
    if (homeLoadingMoveYDistance.value > 60) {
      getData()
    }
    toolbarStyleTransitionDuration.value = 300
    homeLoadingMoveYDistance.value = 0
  }

  if (isCanRightWiping.value) {
    if (currentSlideItemIndex.value === 0 && !isDrawRight.value) return
    if (
      currentSlideItemIndex.value === slideItems.value.length - 1 &&
      isDrawRight.value
    )
      return

    if (!slideList.value) return
    if (!indicatorRef.value) return

    _css(slideList.value, 'transition-duration', `300ms`)
    if (isHome.value) _css(indicatorRef.value, 'transition-duration', `300ms`)
    const endTime = Date.now()
    let gapTime = endTime - startTime.value

    if (moveXDistance.value !== 0) {
      _stopPropagation(e)
    }
    if (Math.abs(moveXDistance.value) < 20) gapTime = 1000
    if (gapTime < 500) {
      changeIndex(
        false,
        isDrawRight.value
          ? currentSlideItemIndex.value + 1
          : currentSlideItemIndex.value - 1,
      )
    } else {
      changeIndex(false)
    }

    moveXDistance.value = 0
    isCanDownWiping.value = false
    isCanRightWiping.value = false
    isNeedCheck.value = true
  }
}

function checkDirection() {
  if (isNeedCheck.value) {
    const judgeMoveXDistance = Math.abs(moveXDistance.value)
    const judgeMoveYDistance = Math.abs(moveYDistance.value)
    isCanRightWiping.value = judgeMoveXDistance > judgeMoveYDistance
    isCanDownWiping.value = !isCanRightWiping.value
    isNeedCheck.value = false
  }
}

function getWidth(index: number) {
  let width = 0
  for (let i = 0; i < index; i++) {
    if (slideItemsWidths.value.length) {
      width += Number(slideItemsWidths.value[i])
    }
  }
  return width
}
</script>

<template>
  <div id="base-slide-wrapper" ref="slideWrapper">
    <div
      class="indicator-bullets"
      v-if="indicatorType === 'bullets' && slideItems.length"
    >
      <div
        class="bullet"
        :class="{ active: currentSlideItemIndex === item - 1 }"
        :key="i"
        v-for="(item, i) in slideItems.length"
      ></div>
    </div>

    <div
      id="base-slide-list"
      ref="slideList"
      :style="{ 'flex-direction': 'row' }"
      @touchstart="touchStart($event)"
      @touchmove="touchMove($event)"
      @touchend="touchEnd($event)"
    >
      <slot></slot>
    </div>
  </div>
</template>
