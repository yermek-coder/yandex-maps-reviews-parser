<template>
  <div class="pt-2 max-w-2xl mx-auto">
    <div
      v-if="!$route.params.id"
      class="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-2xl text-center min-h-[300px]"
    >
      <p class="text-gray-500 text-sm mb-4">
        Перейдите в настройки и укажите ссылку на Яндекс Карты
      </p>
    </div>

    <div
      v-else-if="loading"
      class="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-2xl text-center min-h-[300px]"
    >
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"
      ></div>
      <p class="text-gray-400 text-sm">Загрузка отзывов...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl text-center min-h-[300px]"
    >
      <p class="text-red-600 font-medium text-sm mb-4">{{ error }}</p>
      <button
        @click="fetchReviews"
        class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
      >
        Повторить попытку
      </button>
    </div>

    <div
      v-else-if="reviews.length > 0"
      class="grid grid-cols-1 gap-6 items-start"
    >
      <aside>
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <span
            class="block text-3xl font-bold text-gray-900 tracking-tight mb-2"
          >
            {{ summary.name || 'Название организации' }}
          </span>
          <span
            class="block text-5xl font-bold text-gray-900 tracking-tight mb-2"
          >
            {{ summary.rating || '-' }}
          </span>

          <ReviewStars :rating="summary.rating || 0" size="lg" class="mb-4" />

          <hr class="border-t border-gray-100 my-3" />

          <p class="text-xs text-gray-500 font-medium">
            Всего отзывов на Яндекс:
            <span class="text-gray-900 font-bold block text-sm mt-0.5">
              {{ (summary.review_count || 0).toLocaleString('ru-RU') }}
            </span>
          </p>

          <hr class="border-t border-gray-100 my-3" />

          <p class="text-xs text-gray-500 font-medium">
            Всего оценок на Яндекс:
            <span class="text-gray-900 font-bold block text-sm mt-0.5">
              {{ (summary.rating_count || 0).toLocaleString('ru-RU') }}
            </span>
          </p>
        </div>
      </aside>

      <div class="flex flex-col gap-4">
        <BasePagination
          v-if="totalPages > 1"
          :model-value="currentPage"
          :total-pages="totalPages"
          @change="handlePageChange"
        />

        <div class="flex flex-col gap-4">
          <ReviewCard
            v-for="review in reviews"
            :key="review.id"
            :review="review"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-2xl text-center min-h-[300px]"
    >
      <p class="text-gray-400 text-sm">Нет доступных отзывов</p>
    </div>
  </div>
</template>

<script setup>
// @ts-check

import { ref } from 'vue'
import ReviewStars from '@/components/reviews/Stars.vue'
import ReviewCard from '@/components/reviews/Card.vue'
import BasePagination from '@/components/BasePagination.vue'
import { useRoute } from 'vue-router'
import reviewsService from '@/services/reviews'

const route = useRoute()

// Состояние компонента
const reviews = ref([])
const summary = ref({
  rating: null,
  review_count: 0,
  rating_count: 0,
  name: '',
})
const currentPage = ref(1)
const totalPages = ref(0)
const loading = ref(false)
const error = ref('')

const fetchReviews = async () => {
  loading.value = true
  error.value = ''

  const orgId = route.params.id
  if (!orgId) {
    error.value = 'Не удалось распознать ID организации в ссылке'
    loading.value = false
    return
  }

  try {
    const data = await reviewsService.getReviews(orgId, currentPage.value)

    reviews.value = data.reviews?.data || []
    totalPages.value = data.reviews?.last_page || 1
    summary.value = data.organization || {
      rating: null,
      review_count: 0,
      rating_count: 0,
      name: '',
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

fetchReviews()

const handlePageChange = newPage => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    fetchReviews()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
