<template>
  <header
    class="flex items-center gap-4 mb-6"
    :class="$route.path !== '/' ? 'justify-between' : 'justify-end'"
  >
    <RouterLink
      v-if="$route.path !== '/'"
      to="/"
      class="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      <svg
        class="h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      Назад
    </RouterLink>

    <div class="flex-shrink-0">
      <button
        type="button"
        class="group flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-red-600 hover:border-red-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label="Выход из аккаунта"
        title="Выход из аккаунта"
        @click="logout"
      >
        <svg
          class="h-5 w-5 transition-colors duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth'

const { logout } = useAuth()
</script>
