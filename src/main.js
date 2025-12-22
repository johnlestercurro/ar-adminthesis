//import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import router from './router'
import { supabase } from '@/utils/supabase'  // Import supabase client

const app = createApp(App)

const vuetify = createVuetify({
  components,
  directives,
})

app.use(createPinia())
app.use(router)
app.use(vuetify)

// NEW: Global auth listener — catches Google login and redirects to dashboard
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    router.push('/dashboard');
  }
});

app.mount('#app')
