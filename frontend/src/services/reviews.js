import API from './api'

class ReviewsService {
  async parseReviewsUrl(yandexUrl) {
    if (!yandexUrl?.trim()) {
      throw new Error('Ссылка не может быть пустой')
    }
    return API.post('/api/yandex/parse-reviews', { url: yandexUrl.trim() })
  }

  async getReviews(orgId, page = 1) {
    if (!orgId) {
      throw new Error('Не указан ID организации')
    }
    return API.get('/api/yandex/reviews', {
      org_id: orgId,
      page: page,
    })
  }
}

export default new ReviewsService()
