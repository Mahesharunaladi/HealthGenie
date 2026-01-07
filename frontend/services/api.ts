import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { LoginResponse, User } from '@/types/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token')
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized - redirect to login
                    localStorage.removeItem('access_token')
                    window.location.href = '/login'
                }
                return Promise.reject(error)
            }
        )
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config)
        return response.data
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config)
        return response.data
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config)
        return response.data
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config)
        return response.data
    }

    async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> {
        const formData = new FormData()
        formData.append('file', file)

        if (additionalData) {
            Object.keys(additionalData).forEach((key) => {
                formData.append(key, additionalData[key])
            })
        }

        const response = await this.client.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    }
}

export const apiClient = new ApiClient()

// Auth API
export const authApi = {
    login: (email: string, password: string) => {
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)
        return apiClient.post<LoginResponse>('/api/v1/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
    },
    register: (data: any) => apiClient.post<User>('/api/v1/auth/register', data),
    getCurrentUser: () => apiClient.get<User>('/api/v1/auth/me'),
    logout: () => apiClient.post('/api/v1/auth/logout'),
}

// ML API
export const mlApi = {
    predictBrainTumor: (file: File) =>
        apiClient.uploadFile('/api/v1/ml/predict-brain-tumor', file),
    predictDiabetes: (data: any) =>
        apiClient.post('/api/v1/ml/predict-diabetes', data),
    getPredictions: () =>
        apiClient.get('/api/v1/ml/predictions'),
    getPrediction: (id: string) =>
        apiClient.get(`/api/v1/ml/predictions/${id}`),
}

// Patient API
export const patientApi = {
    getProfile: () => apiClient.get('/api/v1/patients/profile'),
    updateProfile: (data: any) => apiClient.put('/api/v1/patients/profile', data),
}

// Doctor API
export const doctorApi = {
    getProfile: () => apiClient.get('/api/v1/doctors/profile'),
    updateProfile: (data: any) => apiClient.put('/api/v1/doctors/profile', data),
    reviewPrediction: (id: string, notes: string, approve: boolean) =>
        apiClient.post(`/api/v1/doctors/review-prediction/${id}`, { doctor_notes: notes, approve }),
}

// Reports API
export const reportsApi = {
    generateReport: (predictionId: string) =>
        apiClient.post('/api/v1/reports/generate', { prediction_id: predictionId }),
    getReport: (reportId: string) =>
        apiClient.get(`/api/v1/reports/${reportId}`),
}
