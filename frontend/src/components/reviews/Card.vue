<template>
  <article
    class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-50"
    >
      <div class="flex flex-col">
        <span class="text-base font-semibold text-gray-900">{{
          review.user_name || 'Анонимный пользователь'
        }}</span>
        <span class="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
          {{ formatDate(review.date_published) }}
          <template v-if="review.org_name">
            <span class="text-gray-200">•</span>
            <span class="font-medium text-gray-500"
              >{{ review.org_name }} 📍</span
            >
          </template>
        </span>
      </div>
      <ReviewStars :rating="review.rating" />
    </div>
    <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
      {{ review.text }}
    </p>
  </article>
</template>

<script setup>
import ReviewStars from '@/components/reviews/Stars.vue'

defineProps({
  review: { type: Object, required: true },
})

const formatDate = dateStr => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>
