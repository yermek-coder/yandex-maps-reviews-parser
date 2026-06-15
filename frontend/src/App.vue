<template>
  <div
    class="min-h-screen flex bg-white text-gray-900 selection:bg-indigo-50 selection:text-indigo-900"
  >
    <!-- Состояние загрузки авторизации -->
    <template v-if="authLoading">
      <div
        class="fixed inset-0 flex items-center justify-center text-sm font-medium text-gray-500 bg-white"
      >
        <div class="flex flex-col items-center gap-2">
          <svg
            class="animate-spin h-5 w-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Загрузка…</span>
        </div>
      </div>
    </template>

    <!-- Окно авторизации -->
    <template v-else-if="!isAuthenticated">
      <AuthModal />
    </template>

    <!-- Основной контент приложения -->
    <template v-else>
      <main class="flex-1 min-w-0 bg-white px-6 py-6 md:px-8">
        <PageHeader />

        <hr
          class="mx-[-1.5rem] md:mx-[-2rem] my-5 border-0 border-t border-gray-100"
        />

        <RouterView />
      </main>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import PageHeader from './components/PageHeader.vue'
import AuthModal from './components/AuthModal.vue'
import { useAuth } from './composables/useAuth'

const { isAuthenticated, authLoading, fetchUser } = useAuth()

onMounted(fetchUser)
</script>
