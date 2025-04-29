<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, formActionDefault } from '@/utils/supabase'
import { getAvatarText } from '@/utils/helpers'

// Router for navigation
const userRouter = useRouter()

// User profile variables
const initials = ref('')
const email = ref('')
const fullname = ref('')

// Form action state for logout
const formAction = ref({ ...formActionDefault })

// Fetch user data on mount
onMounted(async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    if (user) {
      email.value = user.email || ''
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      fullname.value = profile.full_name || 'Unknown User'
      initials.value = getAvatarText(fullname.value)
    } else {
      userRouter.push('/login') // Redirect to login if no user
    }
  } catch (error) {
    console.error('Error fetching user data:', error.message)
    userRouter.push('/login')
  }
})

// Logout function
const onLogout = async () => {
  formAction.value = { ...formActionDefault, formProcess: true }
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    formAction.value.formProcess = false
    userRouter.replace('/')
  } catch (error) {
    console.error('Error during logout:', error)
    formAction.value = {
      formProcess: false,
      formStatus: 400,
      formErrorMessage: 'Logout failed. Please try again.',
      formSuccessMessage: '',
    }
  }
}

// User data object for the menu
const userData = ref({
  initials: initials.value,
  email: email.value,
  fullname: fullname.value,
})

// Update userData when refs change
onMounted(() => {
  userData.value = {
    initials: initials.value,
    email: email.value,
    fullname: fullname.value,
  }
})
</script>

<template>
  <v-app-bar flat color="#2E5AAC" class="profile-header">
    <v-container class="d-flex align-center justify-space-between">
      <!-- Profile Menu -->
      <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="deep-orange-lighten-1" size="large">
              <span class="text-h5">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card class="mt-1">
          <v-card-text>
            <v-list>
              <v-list-item :subtitle="email" :title="fullname">
                <template v-slot:prepend>
                  <v-avatar color="deep-orange-lighten-1" size="large">
                    <span class="text-h5">{{ initials }}</span>
                  </v-avatar>
                </template>
              </v-list-item>
              <v-divider class="my-3"></v-divider>
              <v-list-item @click="onLogout">
                <v-list-item-title>Logout</v-list-item-title>
                <template v-slot:prepend>
                  <v-icon>mdi-logout</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>

      <!-- Error Message -->
      <v-snackbar
        v-model="formAction.formErrorMessage"
        color="error"
        :timeout="3000"
      >
        {{ formAction.formErrorMessage }}
      </v-snackbar>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.profile-header {
  background-color: #2E5AAC; /* Matches your dashboard navbar */
}
.text-white {
  color: white;
}
</style>
