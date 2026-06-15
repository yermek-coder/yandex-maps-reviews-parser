class API {
  constructor() {
    this.baseUrl = (
      import.meta.env?.VITE_APP_URL || 'http://localhost:8080'
    ).replace(/\/$/, '')
  }

  async request(endpoint, options = {}) {
    // Динамически импортируем composable для получения актуального токена
    // (Избегаем проблем с инициализацией Vue вне контекста приложения)
    const { useAuth } = await import('@/composables/useAuth')
    const { token } = useAuth()

    const url = `${this.baseUrl}${endpoint}`

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      ...options.headers,
    }

    try {
      const response = await fetch(url, { ...options, headers })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Ошибка сервера: ${response.status}`
        )
      }

      return data
    } catch (error) {
      console.error(`[API Error] в эндпоинте ${endpoint}:`, error)
      throw error
    }
  }

  get(endpoint, params) {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val))
        }
      })
      url += `?${searchParams.toString()}`
    }
    return this.request(url, { method: 'GET' })
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

export default new API()
