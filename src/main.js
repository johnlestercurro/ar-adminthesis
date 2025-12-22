// main.js (complete updated version)

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { supabase } from '@/utils/supabase'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({ components, directives })

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)

// Global OAuth error bypass + redirect
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Clean up any error params from Google redirect
    if (window.location.search.includes('error=server_error') || 
        window.location.hash.includes('access_token')) {
      console.warn('Detected Supabase OAuth error — cleaning URL and redirecting');
      history.replaceState({}, '', window.location.pathname);
    }
    // Redirect to dashboard if not already there
    if (router.currentRoute.value.path !== '/dashboard') {
      console.log('SIGNED_IN → Redirecting to /dashboard');
      router.push('/dashboard');
    }
  }
});

// Mount app
app.mount('#app')
