import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/utils/supabase'
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import DashboardView from '@/views/auth/DashboardView.vue'
import SettingsView from '@/views/auth/SettingsView.vue'
import AboutusView from '@/views/auth/AboutusView.vue'
import ProfileView from '@/views/auth/ProfileView.vue'
import UsersManagementView from '@/views/auth/UsersManagementView.vue'
import destinationsView from '@/views/auth/destinationsView.vue'
import FeedbackView from '@/views/auth/FeedbackView.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView,
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
    path: '/destinations',
    name: 'Destinations',
    component: destinationsView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/', // Redirect unknown routes to login
  },
  {
    path: '/feedback',
    name: 'FeedbackView',
    component: FeedbackView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reset_password',
    name: 'Reset_Password',
    component: ResetPassword,
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// NEW: Global auth listener — safe way to handle login events (including Google)
supabase.auth.onAuthStateChange((event, session) => {
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
    if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/login') {
      router.push('/dashboard')
    }
  }
})

// Updated beforeEach — avoids Supabase NULL column bug by not calling getSession() on every navigation
router.beforeEach(async (to, from, next) => {
  console.log(`Navigating to: ${to.path}, Meta:`, to.meta)

  if (to.meta.requiresAuth) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.warn('User not authenticated, redirecting to /')
      return next('/')
    }

    // Check if route requires Admin role
    if (to.meta.requiresAdmin) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        console.log('Authenticated user ID:', userId)
        if (!userId) {
          console.warn('No user ID found, redirecting to /')
          return next('/')
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()
        console.log('Profile fetch response:', { profileData, profileError })

        if (profileError || !profileData || profileData.role !== 'Admin') {
          console.warn('User is not Admin or profile fetch failed, redirecting to /dashboard')
          return next('/dashboard')
        }
        console.log('User is Admin, allowing access')
      } catch (error) {
        console.error('Error checking user role:', error.message)
        return next('/dashboard')
      }
    }
  }

  next()
})

export default router
