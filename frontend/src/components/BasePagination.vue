<template>
  <div class="flex items-center justify-between px-4 py-4 sm:px-0">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="emit('change', modelValue - 1)"
        :disabled="modelValue === 1"
        class="relative inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Назад
      </button>
      <button
        @click="emit('change', modelValue + 1)"
        :disabled="modelValue === totalPages"
        class="relative ml-3 inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Вперед
      </button>
    </div>

    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <p class="text-sm text-gray-500">
        Страница
        <span class="font-semibold text-gray-900">{{ modelValue }}</span> из
        <span class="font-semibold text-gray-900">{{ totalPages }}</span>
      </p>

      <nav
        class="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white ring-1 ring-inset ring-gray-300"
        aria-label="Pagination"
      >
        <button
          @click="emit('change', modelValue - 1)"
          :disabled="modelValue === 1"
          class="relative inline-flex items-center rounded-l-xl px-3 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.83 10l3.94 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="emit('change', page)"
          :class="[
            page === modelValue
              ? 'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
              : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50',
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="emit('change', modelValue + 1)"
          :disabled="modelValue === totalPages"
          class="relative inline-flex items-center rounded-r-xl px-3 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true }, // Текущая страница
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['change'])

const visiblePages = computed(() => {
  const range = []
  const maxVisible = 5
  let start = Math.max(1, props.modelValue - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) range.push(i)
  return range
})
</script>
