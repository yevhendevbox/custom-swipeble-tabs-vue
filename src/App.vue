<script setup lang="ts">
import { type Settings, VSlickCarousel } from 'v-slick-carousel'
import SlideItem from '@/components/SlideItem.vue'
import HomeIndicator from '@/components/HomeIndicator.vue'

import { type ComponentInstance, computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { useBaseValues } from '@/composables/useBaseValues'

const { verticalScrollIsBlocked } = useBaseValues()

const state = reactive({
  navIndex: 0
})

const slides = computed(() => {
  const PREFIXES = ['One', 'Two', 'Three', 'Four'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { component: ComponentInstance<any> }[] = [];

  PREFIXES.forEach((prefix) => {
    result.push({
      component: defineAsyncComponent(() => import(`@/components/slides/Slide${prefix}.vue`)),
    })
  })
  return result
})

const carousel = ref()
const slickOptions = ref<Settings>({
  swipe: true,
  groupsToShow: 1,
  groupsToScroll: 1,
  slidesPerGroup: 1,
  infinite: false,
  // lazyLoad: 'ondemand',
  ignorePrefersReducedMotion: true,
});
function handleSwipe() {
  const wrapperElement = carousel.value.$el.querySelector('.v-slick-track')
  console.log(wrapperElement)
}

watch(
  () => state.navIndex,
  (newValue) => {
    if (carousel.value) {
      console.log(carousel.value)
      carousel.value.goTo(newValue)
    }
  }
)
</script>

<template>
  <div>
    <SlideItem>
      <HomeIndicator v-model:index="state.navIndex" name="main" />

      <VSlickCarousel ref="carousel" v-bind="slickOptions" @swipe="handleSwipe">
        <SlideItem v-for="(slide, index) in slides" :key="index">
          <component :is="slide.component" :class="{ 'slide-content_container': !verticalScrollIsBlocked }"/>
        </SlideItem>
      </VSlickCarousel>
    </SlideItem>

  </div>
</template>


<style scoped>

</style>
