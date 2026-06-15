<template>
  <div class="flex gap-0.5 shrink-0">
    <span
      v-for="n in 5"
      :key="n"
      :class="[
        sizeClass,
        n <= Math.floor(rating) ? 'text-amber-400' : 'text-gray-200',
      ]"
      aria-hidden="true"
      >★</span
    >
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: { type: Number, default: 0 },
  size: { type: String, default: 'sm' }, // 'sm' или 'lg'
})

const sizeClass = computed(() => (props.size === 'lg' ? 'text-xl' : 'text-sm'))
</script>
