<template>
  <div class="slide-item px-2 pt-8">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less">
.slide-item {
  height: 100%;
  width: 100%;
  flex-shrink: 0;
  position: relative;
}
</style>
