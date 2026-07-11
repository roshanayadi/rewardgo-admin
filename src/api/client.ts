import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { toast } from 'sonner'
import type { ApiResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1'

const TOKEN_KEY = 'rewardgo_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' },
})

// Attach bearer token on every request.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRedirecting = false

// Normalise errors and surface them via toast; force logout on 401.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status
    const payload = error.response?.data

    if (status === 401 && !isRedirecting) {
      isRedirecting = true
      tokenStore.clear()
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login'
      }
      setTimeout(() => (isRedirecting = false), 1000)
    }

    // Don't toast validation errors (forms handle those inline).
    if (status && status !== 422 && status !== 401) {
      toast.error(payload?.message ?? 'Something went wrong. Please try again.')
    }

    return Promise.reject(error)
  },
)

/** Unwrap the API envelope's `data`. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise
  return res.data.data
}

/** Return both data and pagination meta. */
export async function unwrapList<T>(
  promise: Promise<{ data: ApiResponse<T[]> }>,
): Promise<{ data: T[]; meta?: ApiResponse['meta'] }> {
  const res = await promise
  return { data: res.data.data, meta: res.data.meta }
}
