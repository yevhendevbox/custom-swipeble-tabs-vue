<script setup lang="ts">
import 'swiper/css';

import { Swiper, SwiperSlide } from 'swiper/vue'
import { type Swiper as SwiperType } from 'swiper/types'
import SlideItem from '@/components/SlideItem.vue'
import HomeIndicator from '@/components/HomeIndicator.vue'

import SlideOne from '@/components/slides/SlideOne.vue'
import SlideTwo from '@/components/slides/SlideTwo.vue'
import SlideThree from '@/components/slides/SlideThree.vue'
import SlideFour from '@/components/slides/SlideFour.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { SlideType } from '@/utils/const_var'
import { type CustomPointerEvent } from '@/utils/slide'

import {
  slideTouchEnd,
  slideTouchMove,
  slideTouchStart,
  slideReset,
  slideInit
} from '@/utils/slide'

const breakpoints = {
  640: {
    allowTouchMove: false,
    onlyExternal: true,
  },
  639: {
    allowTouchMove: true,
    onlyExternal: false,
  },
}

const swiperRef = ref<SwiperType | null>(null)
const navIndex = ref(0)

const state = reactive({
  judgeValue: 20,
  type: SlideType.HORIZONTAL,
  name: 'main',
  localIndex: navIndex.value,
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

function onSlideChange(swiper: SwiperType) {
  navIndex.value = swiper.activeIndex

  state.localIndex = swiper.activeIndex
}

function onSwiperInit(swiper: SwiperType) {
  swiperRef.value = swiper
}

function setActiveSlide(index: number) {
  navIndex.value = index
  state.localIndex = index

  swiperRef.value?.slideTo(index)
}

function onTouchStart(swiper: SwiperType, event: MouseEvent | TouchEvent | PointerEvent) {
  slideTouchStart(event as CustomPointerEvent, swiper.wrapperEl, state)
}

function onTouchMove(swiper: SwiperType, event: MouseEvent | TouchEvent | PointerEvent) {
  slideTouchMove(event as CustomPointerEvent, swiper.wrapperEl, state)
}

function onTouchEnd(swiper: SwiperType, event: MouseEvent | TouchEvent | PointerEvent) {
  slideTouchEnd(event as CustomPointerEvent, state)

  slideReset(event as CustomPointerEvent, swiper.wrapperEl, state)
}

function updateSwiperSettings() {
  if (swiperRef.value) {
    const isDesktop = window.innerWidth >= 640;
    swiperRef.value.allowTouchMove = !isDesktop;
    swiperRef.value.update();
  }
}

watch(
  () => navIndex.value,
  (newValue) => {
    setActiveSlide(newValue)
    updateSwiperSettings()
  }
)

onMounted(() => {
  slideInit(swiperRef.value?.wrapperEl as HTMLElement, state)
})
</script>
<template>
  <div>
    <SlideItem>
      <HomeIndicator v-model:index="navIndex" name="main"  />

      <Swiper
        @slide-change="onSlideChange"
        @swiper="onSwiperInit"
        @touch-start="onTouchStart"
        @touch-move="onTouchMove"
        @touch-end="onTouchEnd"
        :slides-per-view="1"
        :breakpoints="breakpoints"
        :simulate-touch="true"
      >
        <SwiperSlide>
          <SlideItem>
            <SlideOne/>
          </SlideItem>
        </SwiperSlide>

        <SwiperSlide>
          <SlideItem>
            <SlideTwo/>
          </SlideItem>
        </SwiperSlide>

        <SwiperSlide>
          <SlideItem>
            <SlideThree/>
          </SlideItem>
        </SwiperSlide>

        <SwiperSlide>
          <SlideItem>
            <SlideFour/>
          </SlideItem>
        </SwiperSlide>
      </Swiper>
    </SlideItem>
  </div>
</template>


<style scoped>

</style>
