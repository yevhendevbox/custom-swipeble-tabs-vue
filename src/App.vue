<script setup lang="ts">
import HorizontalSlideWrapper from '@/components/HorizontalSlideWrapper.vue'
import SlideItem from '@/components/SlideItem.vue'
import HomeIndicator from '@/components/HomeIndicator.vue'

import SlideOne from '@/components/slides/SlideOne.vue'
import SlideTwo from '@/components/slides/SlideTwo.vue'
import SlideThree from '@/components/slides/SlideThree.vue'
import SlideFour from '@/components/slides/SlideFour.vue'
import { reactive } from 'vue'

const state = reactive({
  navIndex: 0
})
</script>

<template>
  <div>
    <SlideItem>
      <HomeIndicator v-model:index="state.navIndex" />

      <HorizontalSlideWrapper v-model:index="state.navIndex" name="main-slide">
        <SlideItem>
          <SlideOne :active="state.navIndex === 0" />
        </SlideItem>

        <SlideItem>
          <SlideTwo :active="state.navIndex === 1" />
        </SlideItem>

        <SlideItem>
          <SlideThree :active="state.navIndex === 2" />
        </SlideItem>

        <SlideItem>
          <SlideFour :active="state.navIndex === 3" />
        </SlideItem>
      </HorizontalSlideWrapper>
    </SlideItem>
  </div>
</template>


<style scoped>

</style>
