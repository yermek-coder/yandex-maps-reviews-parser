<template>
  <div
    class="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl p-6 shadow-sm ring-1 ring-gray-900/5"
  >
    <div class="mb-6">
      <h1
        class="text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2"
      >
        <svg
          class="h-5 w-5 text-red-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 13.5h-1.5v-7H11v7zm3.25 0H12.5v-3.5h.75c.69 0 1.25.56 1.25 1.25v2.25z"
          />
        </svg>
        Подключить Яндекс Карты
      </h1>
      <p class="text-sm text-gray-500 mt-1 leading-relaxed">
        Укажите ссылку на страницу вашей организации в Яндекс Картах, чтобы
        настроить автоматический импорт отзывов.
      </p>

      <div
        class="mt-3 text-xs bg-gray-50/70 border border-gray-100 rounded-xl p-3 text-gray-600"
      >
        <span class="block font-medium text-gray-400 mb-1">Пример ссылки:</span>
        <code
          class="break-all font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-gray-200/60 block select-all"
        >
          https://yandex.ru/maps/org/somoye_populyamoye_kafe/1010501395/reviews/
        </code>
      </div>
    </div>

    <form @submit.prevent="onSave" class="flex flex-col sm:flex-row gap-2.5">
      <div class="relative flex-1">
        <input
          v-model="yandexUrl"
          type="url"
          class="w-full px-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200"
          placeholder="https://yandex.ru/maps/org/..."
          :disabled="loading"
          required
        />
      </div>

      <button
        type="submit"
        class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shrink-0 min-w-[125px]"
        :disabled="loading"
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
          Связывание...
        </template>
        <template v-else> Сохранить </template>
      </button>
    </form>

    <div
      v-if="error"
      class="mt-4 p-3.5 bg-red-50/60 border border-red-100 rounded-xl text-sm text-red-700 flex items-start gap-2.5 animate-fadeIn"
    >
      <svg
        class="h-4 w-4 text-red-500 shrink-0 mt-0.5"
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
      <span class="font-medium text-xs leading-relaxed">{{ error }}</span>
    </div>

    <div
      v-if="reviewsData"
      class="mt-6 border-t border-gray-100 pt-6 animate-fadeIn"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span
            class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
          ></span>
          Организация успешно подключена
        </h2>
      </div>

      <div class="bg-gray-50/50 border border-gray-200/60 rounded-xl p-4 mb-5">
        <h3 class="text-base font-bold text-gray-900 mb-3">
          {{ reviewsData.meta?.company_name || 'Название не определено' }}
        </h3>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div class="bg-white p-2.5 rounded-lg border border-gray-100">
            <span class="text-gray-400 block mb-0.5">ID компании</span>
            <span class="font-mono font-bold text-gray-800">{{
              reviewsData.org_id
            }}</span>
          </div>
          <div class="bg-white p-2.5 rounded-lg border border-gray-100">
            <span class="text-gray-400 block mb-0.5">Рейтинг</span>
            <span class="font-bold text-amber-600 flex items-center gap-1">
              ★ {{ reviewsData.meta?.rating || '-' }}
            </span>
          </div>
          <div class="bg-white p-2.5 rounded-lg border border-gray-100">
            <span class="text-gray-400 block mb-0.5">Всего оценок</span>
            <span class="font-bold text-gray-800">{{
              reviewsData.meta?.rating_count || 0
            }}</span>
          </div>
          <div class="bg-white p-2.5 rounded-lg border border-gray-100">
            <span class="text-gray-400 block mb-0.5">Собрано отзывов</span>
            <span class="font-bold text-indigo-600">{{
              reviewsData.meta?.review_count || 0
            }}</span>
          </div>
        </div>
      </div>

      <router-link
        :to="`/reviews/${reviewsData.org_id}`"
        class="group inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all duration-200"
      >
        Перейти к списку отзывов
        <svg
          class="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import reviewsService from '@/services/reviews'

const emit = defineEmits(['url-parsed'])
const { token } = useAuth()

const yandexUrl = ref('')
const loading = ref(false)
const error = ref(null)
const reviewsData = ref(null)

const apiBase = () =>
  import.meta.env.VITE_APP_URL?.replace(/\/$/, '') || 'http://localhost:8080'

async function onSave() {
  if (!yandexUrl.value.trim()) return

  loading.value = true
  error.value = null
  reviewsData.value = null

  try {
    const data = await reviewsService.parseReviewsUrl(yandexUrl.value)

    reviewsData.value = data
    emit('url-parsed', yandexUrl.value.trim())
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
