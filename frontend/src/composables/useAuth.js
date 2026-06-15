import { ref, computed, readonly } from 'vue'

const STORAGE_KEY = 'auth_token'

const token = ref(localStorage.getItem(STORAGE_KEY) || null)
const user = ref(null)
const authLoading = ref(true)
const authError = ref(null)
const dbWaiting = ref(false)

function clearAuthError() {
  authError.value = null
}

const apiBase = () =>
  import.meta.env.VITE_APP_URL?.replace(/\/$/, '') || 'http://localhost:8080'

function isDatabaseError(err) {
  const status = err?.status
  const message = err?.data?.message || ''
  return (
    status === 500 ||
    status === 503 ||
    message.includes('SQLSTATE') ||
    message.includes('Connection') ||
    message.includes('database') ||
    message.includes('MySQL')
  )
}

async function requestWithRetry(
  path,
  options = {},
  maxRetries = 3,
  delay = 1000
) {
  let lastError

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const url = `${apiBase()}/api${path}`
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      }
      if (token.value) {
        headers.Authorization = `Bearer ${token.value}`
      }
      const res = await fetch(url, { ...options, headers })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 401) {
          token.value = null
          user.value = null
          localStorage.removeItem(STORAGE_KEY)
        }
        throw { status: res.status, data }
      }
      return data
    } catch (err) {
      lastError = err

      if (isDatabaseError(err) && attempt < maxRetries - 1) {
        dbWaiting.value = true
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
        continue
      }
    }
  }

  throw lastError
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  async function fetchUser() {
    authLoading.value = true
    authError.value = null
    dbWaiting.value = false
    try {
      if (!token.value) {
        user.value = null
        return
      }
      const data = await requestWithRetry('/user')
      user.value = data.user || null
      if (!data.user) {
        token.value = null
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      if (isDatabaseError(err)) {
        authError.value = 'Подождите, база данных загружается...'
      } else {
        user.value = null
        token.value = null
        localStorage.removeItem(STORAGE_KEY)
      }
    } finally {
      authLoading.value = false
      dbWaiting.value = false
    }
  }

  async function login(email, password) {
    authError.value = null
    dbWaiting.value = false
    try {
      const data = await requestWithRetry('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      token.value = data.token
      user.value = data.user
      localStorage.setItem(STORAGE_KEY, data.token)
      return { success: true }
    } catch (err) {
      let message
      if (isDatabaseError(err)) {
        message = 'Подождите, база данных загружается...'
      } else {
        message =
          err?.data?.message || err?.data?.errors?.email?.[0] || 'Ошибка входа'
      }
      authError.value = message
      return { success: false, error: message }
    }
  }

  async function logout() {
    try {
      await requestWithRetry('/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    user: readonly(user),
    token: readonly(token),
    authLoading: readonly(authLoading),
    authError: readonly(authError),
    dbWaiting: readonly(dbWaiting),
    isAuthenticated,
    fetchUser,
    login,
    logout,
    clearAuthError,
  }
}
