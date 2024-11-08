<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  getSlideOffset,
  slideInit,
  slideReset,
  slideTouchEnd,
  slideTouchMove,
  slideTouchStart,
} from '@/utils/slide'
import { SlideType } from '@/utils/const_var'
import { _css } from '@/utils/dom'

const props = withDefaults(
  defineProps<{
    index: number;
    name: string;
    autoplay?: boolean;
    indicator?: boolean;
    changeActiveIndexUseAnim?: boolean;
  }>(),
  {
    index: 0,
    name: '',
    autoplay: false,
    indicator: false,
    changeActiveIndexUseAnim: true,
  }
);

const emit = defineEmits(['update:index'])

let ob: MutationObserver | null = null

const slideListEl = ref<HTMLElement | null>(null)

const state = reactive({
  judgeValue: 20,
  type: SlideType.HORIZONTAL,
  name: props.name,
  localIndex: props.index,
  needCheck: true,
  next: false,
  isDown: false,
  start: { x: 0, y: 0, time: 0 },
  move: { x: 0, y: 0 },

  wrapper: {
    width: 0,
    height: 0,
    childrenLength: 0,
  },
})

watch(
  () => props.index,
  (newValue, oldValue) => {
    if (state.localIndex !== newValue) {
      state.localIndex = newValue

        if (isAdjacentIndex(oldValue, newValue)) {
          _css(slideListEl.value as HTMLDivElement, 'transition-duration', `300ms`);
        } else {
          _css(slideListEl.value as HTMLDivElement, 'transition-duration', '0ms');
        }
      _css(
        slideListEl.value as HTMLDivElement,
        'transform',
        `translate3d(${getSlideOffset(state, slideListEl.value as HTMLDivElement)}px, 0, 0)`,
      )
    }
  },
)

onMounted(() => {
  if (!slideListEl.value) return

  slideInit(slideListEl.value, state)

  if (props.autoplay) {
    setInterval(() => {
      if (state.localIndex === state.wrapper.childrenLength - 1) {
        emit('update:index', 0)
      } else {
        emit('update:index', state.localIndex + 1)
      }
    }, 3000)
  }

  ob = new MutationObserver(() => {
    if (!slideListEl.value) return
    state.wrapper.childrenLength = slideListEl.value.children.length
  })
  ob.observe(slideListEl.value, { childList: true })
})

onUnmounted(() => {
  if (!ob) return
  ob.disconnect()
})
// eslint-disable-next-line
function touchStart(e: any) {
  slideTouchStart(e, slideListEl.value, state)
}
// eslint-disable-next-line
function touchMove(e: any) {
  slideTouchMove(e, slideListEl.value, state)
}
// eslint-disable-next-line
function touchEnd(e: any) {
  slideTouchEnd(e, state)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  slideReset(e, slideListEl.value, state, emit)
}

function isAdjacentIndex(oldIndex: number, newIndex: number): boolean {
  return Math.abs(oldIndex - newIndex) === 1;
}

</script>

<template>
  <div class="slide horizontal">
    <div
      class="indicator-bullets"
      v-if="props.indicator && state.wrapper.childrenLength"
    >
      <div
        class="bullet"
        :class="{ active: state.localIndex === item - 1 }"
        :key="i"
        v-for="(item, i) in state.wrapper.childrenLength"
      ></div>
    </div>

    <div
      class="slide-list"
      ref="slideListEl"
      @pointerdown.prevent="touchStart"
      @pointermove.prevent="touchMove"
      @pointerup.prevent="touchEnd"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="less">
.indicator-bullets {
  position: absolute;
  bottom: 10rem;
  z-index: 2;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 7rem;

  .bullet {
    @width: 5rem;
    width: @width;
    height: @width;
    border-radius: 50%;
    background: var(--second-btn-color);

    &.active {
      background: white;
    }
  }
}

.slide {
  touch-action: none;
  height: 100%;
  width: 100%;
  transition: height 0.3s;
  position: relative;
  overflow: hidden;

  .slide-infinite {
    z-index: 1;
    margin-top: 0;
    transition: all 0.3s;
  }

  .slide-list {
    height: 100%;
    width: 100%;
    display: flex;
    position: relative;
  }
}
</style>
