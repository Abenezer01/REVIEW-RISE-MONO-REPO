import { create } from 'zustand'

interface User {
    id: string
    email: string
    name?: string
    role?: string
    [key: string]: any
}

interface AuthState {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    login: (user: User, token: string) => void
    logout: () => void
    setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set: any) => ({
    isAuthenticated: false,
    user: null,
    token: null,
    login: (user: User, token: string) => set({ isAuthenticated: true, user, token }),
    logout: () => set({ isAuthenticated: false, user: null, token: null }),
    setToken: (token: string) => set({ token, isAuthenticated: !!token }),
}))
