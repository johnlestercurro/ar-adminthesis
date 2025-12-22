<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  console.log('OAuth callback page loaded')

  // Immediately clean any error params from Supabase OAuth redirect
  if (window.location.search.includes('error') || window.location.hash.includes('access_token')) {
    console.warn('OAuth error params detected in callback - cleaning URL')
    history.replaceState({}, '', '/dashboard')
  }

  // Redirect to dashboard (hard redirect to ensure clean state)
  window.location.href = '/dashboard'
})
</script>

<template>
  <v-container class="text-center pa-8">
    <v-progress-circular indeterminate color="primary" size="64" />
    <p class="mt-4">Redirecting to dashboard...</p>
  </v-container>
</template>
