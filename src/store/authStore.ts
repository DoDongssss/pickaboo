import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, UserRole } from '../types/database.types'

interface AuthState {
  user:         User | null
  role:         UserRole
  isAdmin:      boolean
  isLoading:    boolean
  pendingEmail: string | null

  init:            () => () => void
  loadUserProfile: (authUserId: string) => Promise<void>
  signIn:          (email: string, password: string) => Promise<string | null>
  signUp:          (name: string, email: string, password: string, skillLevel: User['skill_level']) => Promise<string | null>
  signOut:         () => Promise<void>
  forgotPassword:  (email: string) => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:         null,
  role:         'user',
  isAdmin:      false,
  isLoading:    true,
  pendingEmail: null,

  init: () => {
    let mounted = true

    // Initial session hydration
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      if (session?.user) {
        get().loadUserProfile(session.user.id)
      } else {
        set({
          user: null,
          role: 'user',
          isAdmin: false,
          isLoading: false,
        })
      }
    })

    // Auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH EVENT]', event)

        // NEVER block this callback with await

        if (session?.user) {
          get().loadUserProfile(session.user.id)
        } else {
          set({
            user: null,
            role: 'user',
            isAdmin: false,
            isLoading: false,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  },

  loadUserProfile: async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single()

      if (error || !data) {
        console.error('[authStore] Failed to load profile:', error?.message)
        set({ user: null, role: 'user', isAdmin: false, isLoading: false })
        return
      }

      const role    = data.role as UserRole
      const isAdmin = role === 'admin'
      set({ user: data as User, role, isAdmin, isLoading: false })
    } catch (err) {
      console.error('[authStore] Unexpected error:', err)
      set({ user: null, role: 'user', isAdmin: false, isLoading: false })
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true })

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      set({ isLoading: false })
      return error.message
    }

    return null
  },

  signUp: async (name, email, password, skillLevel) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, skill_level: skillLevel } },
    })
    set({ isLoading: false })
    if (error) return error.message
    set({ pendingEmail: email })
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    // Clear state immediately — don't wait for onAuthStateChange
    set({
      user:      null,
      role:      'user',
      isAdmin:   false,
      isLoading: false,
    })
  },

  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return error ? error.message : null
  },
}))