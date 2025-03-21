import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import DashboardView from '@/views/auth/DashboardView.vue'
import SettingsView from '@/views/auth/SettingsView.vue'
import AboutusView from '@/views/auth/AboutusView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignupView,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView,
    },
    {
      path: '/aboutus',
      name: 'AboutUs',
      component: AboutusView,
    },
  ],
})

export default router
