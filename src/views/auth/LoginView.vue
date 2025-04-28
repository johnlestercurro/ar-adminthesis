<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { ref } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'
import { supabase, formActionDefault } from '@/utils/supabase'
import { useRouter } from 'vue-router' // Add router for redirection

const isPasswordVisible = ref(false)
const refVForm = ref()

// Form data
const formDataDefault = {
  email: '',
  password: '',
}

const formData = ref({ ...formDataDefault })

// Alert notification states
const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)
const formAction = ref({ ...formActionDefault })

// Router for redirection after login
const router = useRouter()

// Login function with Supabase
const onSubmit = async () => {
  formAction.value = { ...formActionDefault, formProcess: true }
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password,
    })
    if (error) throw error

    // On successful login
    formAction.value = {
      formProcess: false,
      formStatus: 200,
      formSuccessMessage: 'Login successful!',
      formErrorMessage: '',
    }
    showSuccessAlert.value = true
    formData.value = { ...formDataDefault } // Reset form
    router.push('/dashboard') // Redirect to dashboard
  } catch (error) {
    console.error('Error during login:', error)
    formAction.value = {
      formProcess: false,
      formStatus: 400,
      formErrorMessage: error.message || 'Login failed. Please try again.',
      formSuccessMessage: '',
    }
    showErrorAlert.value = true
  }
}

// Form submission handler
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <!-- Alert Notification -->
  <AlertNotification
    :key="`${showSuccessAlert}-${showErrorAlert}`"
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
    :show-success-alert="showSuccessAlert"
    :show-error-alert="showErrorAlert"
    @update:successAlert="showSuccessAlert = $event"
    @update:errorAlert="showErrorAlert = $event"
  />

  <v-app>
    <v-container fluid class="login-container pa-0">
      <v-row class="fill-height">
        <!-- Left Side Background -->
        <v-col cols="12" md="7" class="d-none d-md-flex background-image" />

        <!-- Right Side Login Form -->
        <v-col cols="12" md="5" class="d-flex align-center justify-center">
          <transition name="fade-slide">
            <v-card class="login-card">
              <v-img class="mx-auto my-6" max-width="120" src="@/assets/ar-navigation-logo.png" />

              <v-card-title class="text-h5 text-center text-white">Log In</v-card-title>

              <v-form ref="refVForm" fast-fail @submit.prevent="onFormSubmit">
                <v-card-text>
                  <div class="text-subtitle-1 text-white">Account</div>

                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    density="compact"
                    placeholder="Email address"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    class="custom-input"
                    :rules="[requiredValidator, emailValidator]"
                  />

                  <div class="text-subtitle-1 d-flex align-center justify-space-between text-white">
                    Password
                    <a class="text-caption text-decoration-none text-blue" href="#">Forgot password?</a>
                  </div>

                  <v-text-field
                    v-model="formData.password"
                    label="Password"
                    :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    density="compact"
                    placeholder="Enter your password"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    class="custom-input"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                    :rules="[requiredValidator]"
                  />

                  <v-card color="surface-variant" variant="tonal">
                    <v-card-text class="text-white text-caption">
                      Warning: After 3 failed login attempts, your account will be temporarily locked for 3 hours.
                    </v-card-text>
                  </v-card>

                  <v-btn
                    type="submit"
                    color="blue"
                    size="large"
                    variant="tonal"
                    block
                    :loading="formAction.formProcess"
                  >
                    Log In
                  </v-btn>

                  <v-card-text class="text-center mt-4">
                    <RouterLink class="router-link text-blue" to="/signup">
                      Sign up now <v-icon icon="mdi-chevron-right" />
                    </RouterLink>
                  </v-card-text>
                </v-card-text>
              </v-form>
            </v-card>
          </transition>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
.login-container {
  height: 100vh;
  overflow: hidden;
}

.background-image {
  background-image: url('@/assets/ar-navigation-bg.jpg');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 30px;
  border-radius: 10px;
  background: rgba(0, 32, 96, 0.95);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.custom-input :deep(input) {
  color: #ffffff !important;
}

.custom-input :deep(::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.router-link {
  text-decoration: none !important;
  color: inherit !important;
}

.router-link:hover,
.router-link:focus,
.router-link:active {
  text-decoration: none !important;
  color: inherit !important;
}

.fade-slide-enter-active {
  animation: fade-slide-in 0.6s ease-out;
}

.fade-slide-leave-active {
  animation: fade-slide-out 0.4s ease-in;
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-slide-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

@media (max-width: 960px) {
  .login-card {
    margin-top: 30px;
    margin-bottom: 30px;
  }
}
</style>
