import { useAuthStore } from '../../store/authStore'

export function useAuth() {
  const {
    user, role, isAdmin, isLoading, isEmailVerified, pendingEmail,
    signIn, signUp, signOut, forgotPassword, verifyEmail,
    setUser, setRole,
  } = useAuthStore()

  return {
    user, role, isAdmin, isLoading, isEmailVerified, pendingEmail,
    signIn, signUp, signOut, forgotPassword, verifyEmail,
    setUser, setRole,
  }
}