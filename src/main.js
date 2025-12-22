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

// Global Supabase auth listener with hard redirect for OAuth error bypass
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Check for the Supabase error URL (this happens before any component mounts)
    if (window.location.search.includes('error=server_error') || 
        window.location.hash.includes('access_token')) {
      console.warn('Supabase OAuth redirect error detected - cleaning URL and forcing redirect to dashboard');
      // Clean the URL and hard redirect to dashboard
      history.replaceState({}, '', '/dashboard');
      window.location.href = '/dashboard'; // Hard redirect is the key to bypass stuck state
    } else if (router.currentRoute.value.path !== '/dashboard') {
      console.log('User signed in - redirecting to /dashboard');
      router.push('/dashboard');
    }
  }
});

// Mount the app
app.mount('#app')
