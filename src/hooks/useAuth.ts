// import { useEffect } from 'react'
// import { supabase } from '../lib/supabase'
// import { useAuthStore } from '../store/authStore'

// /**
//  * Initializes Supabase Auth session on mount.
//  * Syncs auth state changes to authStore.
//  * isAdmin comes from users.role, not Supabase Auth metadata.
//  */
// export function useAuth() {
//   const store = useAuthStore()

//   useEffect(() => {
//     // Load existing session on mount
//     supabase.auth.getSession().then(async ({ data: { session } }) => {
//       if (session?.user) {
//         await store.loadUserProfile(session.user.id)
//       }
//       // store.setLoading(false)
//     })

//     // Listen for auth state changes (login, logout, token refresh)
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         if (session?.user) {
//           await store.loadUserProfile(session.user.id)
//         } else {
//           store.signOut()
//         }
//       }
//     )

//     return () => subscription.unsubscribe()
//   }, [])

//   return {
//     user:            store.user,
//     role:            store.role,
//     isAdmin:         store.isAdmin,
//     isLoading:       store.isLoading,
//     isEmailVerified: store.isEmailVerified,
//     pendingEmail:    store.pendingEmail,
//     signIn:          store.signIn,
//     signUp:          store.signUp,
//     signOut:         store.signOut,
//     forgotPassword:  store.forgotPassword,
//     verifyEmail:     store.verifyEmail,
//   }
// }