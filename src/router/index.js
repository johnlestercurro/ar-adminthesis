import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/utils/supabase'
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import DashboardView from '@/views/auth/DashboardView.vue'
import SettingsView from '@/views/auth/SettingsView.vue'
import AboutusView from '@/views/auth/AboutusView.vue'
import ProfileView from '@/views/auth/ProfileView.vue'
import destinationsView from '@/views/auth/destinationsView.vue'
import FeedbackView from '@/views/auth/FeedbackView.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'
import AuthCallback from '@/views/auth/AuthCallback.vue'  // NEW: Import the callback view

// Helper: Check if user is authenticated
async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// Helper: Check if user is Admin
async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) return false
  return profile.role === 'Admin'
}

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/reset_password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/callback',  // NEW: OAuth callback route
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/aboutus',
    name: 'AboutUs',
    component: AboutusView,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: FeedbackView,
    meta: { requiresAuth: true },
  },
  {
    path: '/destinations',
    name: 'Destinations',
    component: destinationsView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // Catch-all redirect to login
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Clean URL after navigation (remove query params like ?error=...)
router.afterEach(() => {
  history.replaceState({}, '', window.location.pathname)
})

router.beforeEach(async (to, from, next) => {
  console.log(`Navigating to: ${to.path} (from: ${from.path})`)

  const authenticated = await isAuthenticated()

  // Prevent logged-in users from accessing login/signup
  if (to.meta.guestOnly && authenticated) {
    console.log('User already authenticated, redirecting to dashboard')
    return next('/dashboard')
  }

  // Protect authenticated routes
  if (to.meta.requiresAuth && !authenticated) {
    console.warn('Route requires auth - redirecting to login')
    return next('/')
  }

  // Admin-only routes
  if (to.meta.requiresAdmin) {
    const admin = await isAdmin()
    if (!admin) {
      console.warn('User is not Admin - redirecting to dashboard')
      return next('/dashboard')
    }
  }

  next()
})

export default router
