import { useState, useEffect } from 'react'
import {  AxiosRequestConfig, AxiosResponse } from 'axios'
import api from '../services/api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  url: string,
  options?: AxiosRequestConfig,
  dependencies: any[] = []
): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response: AxiosResponse<T> = await api(url, options)
      setState({ data: response.data, loading: false, error: null })
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return {
    ...state,
    refetch: fetchData,
  }
}

export function useApiMutation<T, P = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = async (url: string, data?: P, options?: AxiosRequestConfig) => {
    try {
      setState({ data: null, loading: true, error: null })
      const response: AxiosResponse<T> = await api({
        url,
        method: 'POST',
        data,
        ...options,
      })
      setState({ data: response.data, loading: false, error: null })
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      })
      throw new Error(errorMessage)
    }
  }

  return {
    ...state,
    mutate,
  }
}