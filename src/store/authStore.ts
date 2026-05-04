import { create } from 'zustand'
import type { User } from '../types'
import { MOCK_USERS, MOCK_PASSWORD } from '../data/mock'

type UserRole = 'user' | 'admin'

// Must match an email in MOCK_USERS — role comes from user metadata in Supabase
const ADMIN_EMAILS = ['admin@pickleball.com']

interface AuthState {
  user:             User | null
  role:             UserRole
  isAdmin:          boolean
  isLoading:        boolean
  isEmailVerified:  boolean
  pendingEmail:     string | null   // email waiting for verification

  // Actions
  setUser:          (user: User | null) => void
  setRole:          (role: UserRole) => void
  setLoading:       (v: boolean) => void

  /**
   * Mock sign-in — simulates Supabase auth.signInWithPassword().
   * Replace body with real Supabase call when backend is ready.
   * Returns error string if credentials don't match mock data.
   */
  signIn:   (email: string, password: string) => Promise<string | null>

  /**
   * Mock register — simulates Supabase auth.signUp().
   * Sets pendingEmail so the app shows the verify screen.
   */
  signUp:   (name: string, email: string, password: string, skillLevel: User['skill_level']) => Promise<string | null>

  /**
   * Mock verify email — simulates clicking the confirm link.
   * In real flow, Supabase redirects back to the app with a token.
   */
  verifyEmail: () => void

  /**
   * Mock forgot password — simulates Supabase auth.resetPasswordForEmail().
   * Returns null on success, error string on failure.
   */
  forgotPassword: (email: string) => Promise<string | null>

  signOut: () => void
}

// Mock password (all users use this in dev)


export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,   // start unauthenticated so login screen shows
  role:            'user',
  isAdmin:         false,
  isLoading:       false,
  isEmailVerified: false,
  pendingEmail:    null,

  setUser:    (user)  => set({ user }),
  setRole:    (role)  => set({ role, isAdmin: role === 'admin' }),
  setLoading: (v)     => set({ isLoading: v }),

  signIn: async (email, password) => {
    set({ isLoading: true })
    await new Promise(r => setTimeout(r, 800)) // simulate network

    const found = MOCK_USERS.find(u => u.email === email)
    if (!found || password !== MOCK_PASSWORD) {
      set({ isLoading: false })
      return 'Invalid email or password.'
    }

    const isAdmin = ADMIN_EMAILS.includes(email)
    set({
      user:            found,
      role:            isAdmin ? 'admin' : 'user',
      isAdmin,
      isEmailVerified: true,
      isLoading:       false,
    })
    return null
  },

  // signUp: async (_name, email, _password, _skillLevel) => {
  
  signUp: async (_name, email) => {
    set({ isLoading: true })
    await new Promise(r => setTimeout(r, 800))

    const exists = MOCK_USERS.find(u => u.email === email)
    if (exists) {
      set({ isLoading: false })
      return 'An account with this email already exists.'
    }

    // In real flow: Supabase creates the user and sends a verification email
    set({ isLoading: false, pendingEmail: email })
    return null
  },

  verifyEmail: () => {
    const email = get().pendingEmail
    if (!email) return

    // Simulate the user landing back after clicking the email link
    const newUser: User = {
      id:          `u-${Date.now()}`,
      name:        email.split('@')[0],
      email,
      skill_level: 'beginner',
      created_at:  new Date().toISOString(),
    }
    set({
      user:            newUser,
      role:            'user',
      isAdmin:         false,
      isEmailVerified: true,
      pendingEmail:    null,
    })
  },

  forgotPassword: async (email) => {
    set({ isLoading: true })
    await new Promise(r => setTimeout(r, 800))

    const found = MOCK_USERS.find(u => u.email === email)
    set({ isLoading: false })

    if (!found) return 'No account found with that email.'
    // In real flow: Supabase sends a reset link
    return null
  },

  signOut: () =>
    set({
      user:            null,
      role:            'user',
      isAdmin:         false,
      isEmailVerified: false,
      pendingEmail:    null,
    }),
}))