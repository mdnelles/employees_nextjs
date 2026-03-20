// Axios-compatible API wrapper that delegates to api-client
import { api as apiClient } from './api-client'

class AxiosLikeApi {
  async get<T = any>(url: string, config?: { params?: Record<string, string> }): Promise<{ data: T }> {
    const data = await apiClient.get(url, config?.params)
    return { data: data as T }
  }

  async post<T = any>(url: string, body?: any): Promise<{ data: T }> {
    const data = await apiClient.post(url, body)
    return { data: data as T }
  }

  // These are no-ops for demo mode — edits/deletes are session-only
  async put<T = any>(_url: string, _body?: any): Promise<{ data: T }> {
    return { data: { success: true } as T }
  }

  async delete<T = any>(_url: string): Promise<{ data: T }> {
    return { data: { success: true } as T }
  }
}

const api = new AxiosLikeApi()
export default api
export { api, apiClient }
