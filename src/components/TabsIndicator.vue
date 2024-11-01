<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import bus from '@/utils/bus'
import { _css } from '@/utils/dom'

// Props definition
const props = defineProps({
  activeIndex: {
    type: Number,
    default: 0,
  },
  tabStyleWidth: {
    type: String,
    default: '',
  },
  tabTexts: {
    type: Array,
    default: () => [],
  },
  tabRender: {
    type: Function,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  indicatorType: {
    type: String,
    default: '',
  },
})

// Emit setup
const emit = defineEmits(['update:active-index'])

// Store and data variables
const bodyWidth = document.body.clientWidth
const currentSlideItemIndex = ref(props.activeIndex)
const tabIndicatorRelationActiveIndexLefts = ref<Array<number>>([])
const indicatorSpace = ref(0)
const indicatorRef = ref<HTMLElement | null>(null)
const tabsRef = ref<HTMLElement | null>(null)

// Methods
function changeIndex(index: number) {
  currentSlideItemIndex.value = index
  emit('update:active-index', currentSlideItemIndex.value)

  if (indicatorRef.value) {
    _css(indicatorRef.value, 'transition-duration', '300ms')
    _css(
      indicatorRef.value,
      'left',
      `${tabIndicatorRelationActiveIndexLefts.value[currentSlideItemIndex.value]}px`,
    )
  }
}

function initTabs() {
  if (!tabsRef.value || !indicatorRef.value) return
  tabIndicatorRelationActiveIndexLefts.value = []

  for (let i = 0; i < tabsRef.value.children.length; i++) {
    const item = tabsRef.value.children[i]

    if (item) {
      const tabWidth = _css(item as HTMLElement, 'width')

      if (tabWidth) {
        // indicatorType??????????
        tabIndicatorRelationActiveIndexLefts.value.push(
          item.getBoundingClientRect().x -
            tabsRef.value.children[0].getBoundingClientRect().x +
            (props.indicatorType === 'home' ? (tabWidth as number) * 0.15 : 0),
        )
      }
    }
  }

  indicatorSpace.value =
    tabIndicatorRelationActiveIndexLefts.value[1] -
    tabIndicatorRelationActiveIndexLefts.value[0]

  _css(indicatorRef.value, 'transition-duration', '0ms')
  _css(
    indicatorRef.value,
    'left',
    `${tabIndicatorRelationActiveIndexLefts.value[currentSlideItemIndex.value]}px`,
  )
}

function move(e: DragEvent) {
  if (!indicatorRef.value) return
  // Event type??
  _css(
    indicatorRef.value,
    'left',
    // distance property???
    `${tabIndicatorRelationActiveIndexLefts.value[currentSlideItemIndex.value] - e.x.distance / (bodyWidth / indicatorSpace.value)}px`,
  )
}

function end(index: number) {
  currentSlideItemIndex.value = index

  if (!indicatorRef.value) return

  _css(indicatorRef.value, 'transition-duration', '300ms')
  _css(
    indicatorRef.value,
    'left',
    `${tabIndicatorRelationActiveIndexLefts.value[currentSlideItemIndex.value]}px`,
  )

  setTimeout(() => {
    if (!indicatorRef.value) return
    _css(indicatorRef.value, 'transition-duration', '0ms')
  }, 300)
}

// Lifecycle hooks
onMounted(() => {
  initTabs()
  bus.on(`${props.name}-moved`, move)
  bus.on(`${props.name}-end`, end)
})

// Watchers
watch(
  () => props.activeIndex,
  newIndex => {
    currentSlideItemIndex.value = newIndex
  },
)
</script>

<template>
  <div class="indicator-ctn">
    <div v-if="!props.tabRender" class="tabs" ref="tabsRef">
      <div
        v-for="(item, index) in props.tabTexts"
        :key="index"
        :class="['tab', { active: currentSlideItemIndex === index }]"
        :style="{
          width: props.tabStyleWidth || 100 / props.tabTexts.length + '%',
        }"
        @click="changeIndex(index)"
      >
        <span>{{ item }}</span>
      </div>
    </div>
    <div v-else>
      {{ props.tabRender() }}
    </div>
    <div
      class="indicator"
      ref="indicatorRef"
      :style="{
        width: props.tabStyleWidth || 100 / props.tabTexts.length + '%',
      }"
    />
  </div>
</template>

<style scoped lang="less">
.indicator-ctn {
  //font-size: 14rem;
  width: 100%;
  height: var(--indicator-height);
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background: var(--main-bg);

  .tabs {
    display: flex;
    justify-content: space-between;
    font-weight: bold;

    .tab {
      height: 40rem;
      width: 45%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: gray;
      transition: color 0.3s;
      //font-size: 16rem;

      &.active {
        color: black;
      }

      img {
        margin-left: 5rem;
        @width: 12rem;
        width: @width;
        height: @width;
      }
    }
  }

  .indicator {
    height: 2px;
    background: gold;
    width: 45%;
    position: relative;
    transition: all 0.3s;
  }
}
</style>
