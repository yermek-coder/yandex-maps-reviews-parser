<template>
  <div
    class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative transform transition-all duration-300 animate-scaleIn"
    >
      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Закрыть"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="mb-5">
        <h2 class="text-xl font-bold text-gray-900 tracking-tight">
          Требуется авторизация
        </h2>
        <p class="text-xs text-gray-500 mt-1">
          Пожалуйста, войдите в аккаунт, чтобы продолжить.
        </p>
      </div>

      <form @submit.prevent="onLogin()" class="flex flex-col gap-3.5">
        <div class="flex flex-col gap-1">
          <label for="auth-email" class="text-xs font-semibold text-gray-700"
            >Email</label
          >
          <input
            id="auth-email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            placeholder="example@mail.com"
            :disabled="loading || dbWaiting"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="auth-password" class="text-xs font-semibold text-gray-700"
            >Пароль</label
          >
          <input
            id="auth-password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            placeholder="••••••••"
            :disabled="loading || dbWaiting"
          />
        </div>

        <div class="space-y-2 mt-1">
          <p
            v-if="authError"
            class="text-xs font-medium text-red-600 flex items-center gap-1.5 animate-fadeIn"
          >
            <svg
              class="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            {{ authError }}
          </p>

          <p
            v-if="dbWaiting"
            class="text-xs font-medium text-indigo-600 flex items-center gap-2 animate-pulse"
          >
            <span
              class="inline-block w-3.5 h-3.5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
            ></span>
            Подождите, база данных загружается...
          </p>
        </div>

        <button
          type="submit"
          class="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading || dbWaiting"
        >
          <template v-if="loading">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            Вход…
          </template>
          <template v-else-if="dbWaiting"> Загрузка… </template>
          <template v-else> Войти </template>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['close'])
const { login, authError, dbWaiting } = useAuth()

const loading = ref(false)
const email = ref('')
const password = ref('')

async function onLogin() {
  loading.value = true
  const result = await login(email.value, password.value)
  loading.value = false
  if (result.success) {
    emit('close')
  }
}
</script>

<style scoped>
.animate-scaleIn {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
