<script setup lang="ts">
import 'swiper/css';

import { Swiper, SwiperSlide } from 'swiper/vue'
import { type Swiper as SwiperType } from 'swiper/types'
// import HorizontalSlideWrapper from '@/components/HorizontalSlideWrapper.vue'
import SlideItem from '@/components/SlideItem.vue'
import HomeIndicator from '@/components/HomeIndicator.vue'

import SlideOne from '@/components/slides/SlideOne.vue'
import SlideTwo from '@/components/slides/SlideTwo.vue'
import SlideThree from '@/components/slides/SlideThree.vue'
import SlideFour from '@/components/slides/SlideFour.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useBaseValues } from '@/composables/useBaseValues'
import { SlideType } from '@/utils/const_var'
import { type CustomPointerEvent } from '@/utils/slide'

import {
  slideTouchEnd,
  slideTouchMove,
  slideTouchStart,
  slideReset,
  slideInit
} from '@/utils/slide'

const { verticalScrollIsBlocked, isMobile } = useBaseValues()

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
}

function onSwiperInit(swiper: SwiperType) {
  swiperRef.value = swiper
}

function setActiveSlide(index: number) {
  navIndex.value = index

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

watch(
  () => isMobile.value,
  (newValue) => {
    if (swiperRef.value) {
      swiperRef.value.allowTouchMove = newValue;
    }
  }
)

onMounted(() => {
  slideInit(swiperRef.value?.wrapperEl as HTMLElement, state)
})
</script>
<template>
  <div>
    <SlideItem>
      <HomeIndicator @update="setActiveSlide($event)" :index="navIndex" name="main"  />

      <Swiper
        :slides-per-view="1"
        @slide-change="onSlideChange"
        @swiper="onSwiperInit"
        @touch-start="onTouchStart"
        @touch-move="onTouchMove"
        @touch-end="onTouchEnd"
      >
        <SwiperSlide>
          <SlideItem>
            <SlideOne :class="{ 'slide-content_container': !verticalScrollIsBlocked }"/>
          </SlideItem>
        </SwiperSlide>

        <SwiperSlide>
          <SlideItem>
            <SlideTwo :class="{ 'slide-content_container': !verticalScrollIsBlocked }"/>
          </SlideItem>
        </SwiperSlide>

        <SwiperSlide>
          <SlideItem>
            <SlideThree :class="{ 'slide-content_container': !verticalScrollIsBlocked }"/>
          </SlideItem>
        </SwiperSlide>

        <SwiperSlide>
          <SlideItem>
            <SlideFour :class="{ 'slide-content_container': !verticalScrollIsBlocked }"/>
          </SlideItem>
        </SwiperSlide>
      </Swiper>
    </SlideItem>
  </div>
</template>


<style scoped>

</style>
