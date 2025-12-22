import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { supabase } from '@/utils/supabase'

// Vuetify setup
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  // Optional: Add theme if you want to customize colors globally
  // theme: {
  //   defaultTheme: 'light',
  //   themes: {
  //     light: {
  //       colors: {
  //         primary: '#6b48ff',
  //         secondary: '#00d2ff',
  //       },
  //     },
  //   },
  // },
})

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(vuetify)

// Global Supabase auth listener (only redirect if not already on dashboard)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Prevent redirect if user is already on dashboard
    if (router.currentRoute.value.path !== '/dashboard') {
      console.log('Auth state changed: SIGNED_IN → Redirecting to /dashboard')
      router.push('/dashboard')
    }
  }
})

// Mount the app
app.mount('#app')
