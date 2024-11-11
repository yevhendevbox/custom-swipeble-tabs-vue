<template>
  <div class="indicator-home" :class="{ isLight }">
    <div class="toolbar" ref="toolbar" :style="toolbarStyle">
      <div class="tab-ctn">
        <div class="tabs" ref="tabsRef">
          <div
            v-for="(tab, idx) in tabs"
            :key="idx"
            :class="{ active: index === idx }"
            class="tab"
            @click.stop="change(idx)"
          >
            <span>{{ tab.text }}</span>
          </div>
        </div>
        <div class="indicator" ref="indicatorRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect, watch } from 'vue'
import { useBaseValues } from '@/composables/useBaseValues'
import { _css } from '@/utils/dom'
import bus from '@/utils/bus'

const props = defineProps({
  name: { type: String, default: '' },
  index: { type: Number, default: 0 },
  isLight: { type: Boolean, default: false },
})

const emit = defineEmits(['update:index'])

const baseStore = useBaseValues()

const indicatorRef = ref(null)
const tabsRef = ref<HTMLElement | null>(null)

const lefts = ref<Array<number>>([])
const indicatorSpace = ref(0)
const moveY = ref(0)
const tabs = ref([
  { text: 'Home' },
  { text: 'News' },
  { text: 'Features' },
  { text: 'Favorites' },
])

// Computed properties
const transform = computed(() => {
  const distance = moveY.value - baseStore.judgeValue.value
  const maxDistance = baseStore.homeRefresh.value

  return `translate3d(0, ${Math.min(distance, maxDistance)}px, 0)`
})

const toolbarStyle = computed(() => {
  if (moveY.value) {
    return {
      opacity: 1 - (moveY.value - baseStore.judgeValue.value) / (baseStore.homeRefresh.value / 2),
      transform: transform.value,
    }
  }
  return {
    opacity: 1,
    'transition-duration': '300ms',
    transform: `translate3d(0, 0, 0)`,
  }
})

// Lifecycle hooks
onMounted(() => {
  initTabs()
  bus.on(`${props.name}-moveX`, move)
  bus.on(`${props.name}-moveY`, (e: number) => (moveY.value = e))
  bus.on(`${props.name}-end`, end)
})

onUnmounted(() => {
  bus.off(`${props.name}-moveX`, move)
  bus.off(`${props.name}-moveY`, () => {})
  bus.off(`${props.name}-end`, end)
})

function change(idx: number) {
  emit('update:index', idx)
  updateIndicatorPosition(idx, 300)

  if (tabsRef.value) {
    Array.from(tabsRef.value.children).forEach((tab, i) => {
      const tabWidth = _css(tab as HTMLElement, 'width')

      if (indicatorRef.value && i === idx) {
        _css(indicatorRef.value, 'width', `${tabWidth}px`)
      }
    })
  }
}

function initTabs() {
  if (!indicatorRef.value) return
  if (!tabsRef.value) return


  Array.from(tabsRef.value.children).forEach((tab, i) => {
    const tabWidth = _css(tab as HTMLElement, 'width')

    if (indicatorRef.value && i === 0) {
      _css(indicatorRef.value, 'width', `${tabWidth}px`)
    }

    if (tabsRef.value) {
      const offset = tab.getBoundingClientRect().x - tabsRef.value.children[0].getBoundingClientRect().x

      if (tabWidth) {
        lefts.value.push(offset)
      }
    }
  })

  // indicatorSpace.value = lefts.value[1] - lefts.value[0]

  if (lefts.value.length > 1) {
    indicatorSpace.value = lefts.value[1] - lefts.value[0]
    // console.log('intiTab resize toggle', indicatorSpace.value)
  } else {
    indicatorSpace.value = 0;
  }
  updateIndicatorPosition(props.index, 300)
}

function updateIndicatorPosition(idx: number, duration: number) {
  if (!indicatorRef.value) return
  _css(indicatorRef.value, 'transition-duration', `${duration}ms`)
  _css(indicatorRef.value, 'left', `${lefts.value[idx]}px`)
}

function move(e: number) {
  if (!indicatorRef.value) return

  _css(indicatorRef.value, 'transition-duration', `0ms`)
  _css(
    indicatorRef.value,
    'left',
    `${lefts.value[props.index] - e / (baseStore.bodyWidth.value / indicatorSpace.value)}px`,
  )
}

function end(idx: number) {
  moveY.value = 0
  updateIndicatorPosition(idx, 300)

  setTimeout(() => {
    if (!indicatorRef.value) return
    _css(indicatorRef.value, 'transition-duration', `0ms`)
  }, 300)
}

watchEffect(() => {
  change(props.index)
})

watch(
  () => baseStore.bodyWidth.value,
  () => initTabs()
)
</script>

<style scoped lang="less">
.indicator-home {
  position: absolute;
  //font-size: 16rem;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  color: black;
  height: var(--home-header-height);
  transition: all 0.3s;
  font-weight: bold;

  .notice {
    opacity: 0;
    top: 0;
    position: absolute;
    width: 100vw;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading {
    opacity: 0;
    top: 7rem;
    right: 7rem;
    position: absolute;
  }

  .toolbar {
    z-index: 2;
    position: relative;
    color: black;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 1rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .tab-ctn {
      width: 80%;
      position: relative;

      .tabs {
        display: flex;
        justify-content: space-between;

        .tab {
          transition: color 0.3s;
          color: rgba(black, 0.7);
          position: relative;
          //font-size: 17rem;
          cursor: pointer;

          .tab1-img {
            position: absolute;
            @width: 12rem;
            width: @width;
            height: @width;
            margin-left: 4rem;
            transition: all 0.3s;
            // margin-top: 7rem;
          }

          .tab2-img {
            position: absolute;
            height: 15rem;
            left: 24rem;
            top: -5rem;
          }

          &.active {
            color: black;
          }
        }
      }

      .indicator {
        //transition: left .3s;
        position: absolute;
        top: 1.5rem;
        height: .1rem;
        width: 2rem;
        left: 0;
        //width: calc(100% / 5);
        background: #000;
        border-radius: 5rem;
      }
    }

    .search {
      color: black;
      //font-size: 24rem;
    }
  }

  .mask {
    top: 0;
    position: absolute;
    width: 100vw;
    height: calc(var(--vh, 1vh) * 100);
    background: #00000066;
  }
}
</style>
