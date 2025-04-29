<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'
import { supabase, formActionDefault } from '@/utils/supabase.js' // Main Supabase client
import AlertNotification from '@/components/common/AlertNotification.vue'
import { useRouter } from 'vue-router'

// UI states
const visible = ref(false)
const formVisible = ref(false)
const refVForm = ref()

// Router for redirection
const router = useRouter()

const formDataDefault = {
  email: '',
  full_name: '',
  phone: '',
  password: '',
  agreed: false,
  role: 'Admin',
}

const formData = ref({ ...formDataDefault })
const formAction = reactive({ ...formActionDefault }) // Use reactive for better object reactivity

const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)

// Animation trigger
onMounted(() => {
  setTimeout(() => {
    formVisible.value = true
  }, 200)

  // Add a global error handler for Supabase auth events (for debugging, can be removed if not needed)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', { event, session })
  })
})

// Validators
const phoneValidator = (value) => {
  return /^\d{7,15}$/.test(value) || 'Enter a valid phone number'
}

const passwordValidator = (value) => {
  return (value && value.length >= 6) || 'Password must be at least 6 characters'
}

const nameValidator = (value) => {
  return (value && value.length >= 2) || 'Full name must be at least 2 characters'
}

// Ensure error alert is hidden when success alert is shown
watch(showSuccessAlert, (newValue) => {
  console.log('showSuccessAlert changed:', newValue, {
    showErrorAlert: showErrorAlert.value,
    formSuccessMessage: formAction.formSuccessMessage,
    formErrorMessage: formAction.formErrorMessage,
  })
  if (newValue) {
    showErrorAlert.value = false // Forcefully hide error alert
    formAction.formErrorMessage = '' // Clear any error message
  }
  if (!newValue && formAction.formSuccessMessage) {
    // Redirect to login when the success alert is closed
    router.push('/') // Correct path based on router config
  }
})

// Log when error alert is triggered and add safeguard
watch(showErrorAlert, (newValue) => {
  console.log('showErrorAlert changed:', newValue, {
    showSuccessAlert: showSuccessAlert.value,
    formSuccessMessage: formAction.formSuccessMessage,
    formErrorMessage: formAction.formErrorMessage,
  })
  if (newValue && showSuccessAlert.value) {
    console.log('Preventing error alert because success alert is active')
    showErrorAlert.value = false
    formAction.formErrorMessage = ''
  }
})

// Log when formErrorMessage is set and add safeguard
watch(() => formAction.formErrorMessage, (newValue) => {
  console.log('formErrorMessage changed:', newValue, {
    showSuccessAlert: showSuccessAlert.value,
    showErrorAlert: showErrorAlert.value,
    formSuccessMessage: formAction.formSuccessMessage,
  })
  if (showSuccessAlert.value && newValue) {
    console.log('Clearing formErrorMessage because success alert is active')
    formAction.formErrorMessage = ''
  }
})

// Fallback redirect in case the user doesn't close the alert
const scheduleRedirect = () => {
  setTimeout(() => {
    if (showSuccessAlert.value) {
      showSuccessAlert.value = false
      router.push('/') // Correct path based on router config
    }
  }, 10000) // Fallback after 10 seconds
}

// Submit Handler
const onFormSubmit = () => {
  refVForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        console.log('Starting form submission...')
        formAction.formProcess = true
        formAction.formErrorMessage = ''
        formAction.formSuccessMessage = ''
        showErrorAlert.value = false // Reset error alert state
        showSuccessAlert.value = false // Reset success alert state

        console.log('State after reset:', {
          showSuccessAlert: showSuccessAlert.value,
          showErrorAlert: showErrorAlert.value,
          formSuccessMessage: formAction.formSuccessMessage,
          formErrorMessage: formAction.formErrorMessage,
        })

        // Sign up the user with the main Supabase instance
        const { data, error } = await supabase.auth.signUp({
          email: formData.value.email,
          password: formData.value.password,
          options: {
            data: {
              phone: formData.value.phone,
              role: formData.value.role,
              full_name: formData.value.full_name,
            },
          },
        })

        console.log('Supabase signUp response:', { data, error })

        if (error) {
          console.log('SignUp error:', error)
          throw error
        }

        // Ensure user data is available
        if (!data.user) {
          console.log('No user data returned from signUp')
          throw new Error('User registration failed: No user data returned.')
        }

        // Handle email verification case
        if (!data.user.confirmed_at) {
          console.log('User registered but email confirmation required')
          formAction.formSuccessMessage = 'Registration successful! Please confirm your email to log in.'
          showSuccessAlert.value = true
          scheduleRedirect()
        } else {
          // Insert user data into profiles table in the main Supabase instance
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id, // Use the user ID from Supabase Auth
              full_name: formData.value.full_name, // Use the full_name from the form
              phone: formData.value.phone,
              role: formData.value.role,
            })

          console.log('Supabase profiles insert response:', { profileError })

          if (profileError) {
            console.log('Profile insert error:', profileError)
            if (profileError.message.includes('constraint') || profileError.message.includes('permission')) {
              formAction.formSuccessMessage = 'Registration successful! Please confirm your email to complete setup.'
              showSuccessAlert.value = true
              scheduleRedirect()
            } else {
              throw profileError
            }
          } else {
            // Success
            console.log('Registration successful, setting success alert...')
            formAction.formSuccessMessage = 'Registration successful! Please log in.'
            showSuccessAlert.value = true
            scheduleRedirect()
          }
        }

        // Clear form
        Object.assign(formData.value, { ...formDataDefault })
        refVForm.value.resetValidation()
      } catch (err) {
        console.log('Caught error in try-catch:', err)
        formAction.formErrorMessage = err.message || 'Registration failed. Please try again.'
        showErrorAlert.value = true
        showSuccessAlert.value = false // Ensure success alert is not shown on error
        formAction.formSuccessMessage = '' // Clear success message
      } finally {
        formAction.formProcess = false
        console.log('Final state after submission:', {
          showSuccessAlert: showSuccessAlert.value,
          showErrorAlert: showErrorAlert.value,
          formSuccessMessage: formAction.formSuccessMessage,
          formErrorMessage: formAction.formErrorMessage,
        })
      }
    }
  })
}
</script>

<template>
  <v-app>
    <!-- Main Layout -->
    <v-container fluid class="signup-container">
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

      <v-row justify="center" align="center" class="signup-row">
        <!-- Form Section -->
        <v-col cols="12" sm="10" md="6" lg="4">
          <v-card class="signup-card" :class="{ 'animate-form': formVisible }">
            <!-- Logo Placeholder -->
            <v-img
              src="@/assets/logo.png"
              max-width="120"
              class="mx-auto mb-6"
              v-if="formVisible"
            />
            <v-card-title class="text-h4 text-center text-primary mb-6">
              Admin Sign Up
            </v-card-title>

            <v-form ref="refVForm" @submit.prevent="onFormSubmit">
              <v-card-text>
                <!-- Full Name -->
                <div class="text-subtitle-1 text-dark mb-2">Full Name</div>
                <v-text-field
                  v-model="formData.full_name"
                  density="comfortable"
                  placeholder="Enter your full name"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  class="custom-input"
                  :rules="[requiredValidator, nameValidator]"
                />

                <!-- Email -->
                <div class="text-subtitle-1 text-dark mb-2">Email Address</div>
                <v-text-field
                  v-model="formData.email"
                  density="comfortable"
                  placeholder="Enter your email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  class="custom-input"
                  :rules="[requiredValidator, emailValidator]"
                />

                <!-- Phone Number -->
                <div class="text-subtitle-1 text-dark mb-2">Phone Number</div>
                <v-text-field
                  v-model="formData.phone"
                  density="comfortable"
                  placeholder="Enter your phone number"
                  prepend-inner-icon="mdi-phone-outline"
                  variant="outlined"
                  class="custom-input"
                  :rules="[requiredValidator, phoneValidator]"
                />

                <!-- Password -->
                <div class="text-subtitle-1 text-dark mb-2">Password</div>
                <v-text-field
                  v-model="formData.password"
                  :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="visible ? 'text' : 'password'"
                  density="comfortable"
                  placeholder="Create a strong password"
                  prepend-inner-icon="mdi-lock-outline"
                  variant="outlined"
                  class="custom-input"
                  @click:append-inner="visible = !visible"
                  :rules="[requiredValidator, passwordValidator]"
                />

                <!-- Terms Agreement -->
                <v-checkbox
                  v-model="formData.agreed"
                  color="primary"
                  class="mt-2"
                  :rules="[(v) => !!v || 'You must agree before continuing']"
                >
                  <template v-slot:label>
                    <span class="text-dark">
                      I agree to the
                      <a class="text-primary text-decoration-none" href="#"
                        >Terms & Privacy Policy</a
                      >
                    </span>
                  </template>
                </v-checkbox>

                <!-- Submit Button -->
                <v-btn
                  type="submit"
                  class="mt-6"
                  size="large"
                  block
                  :disabled="formAction.formProcess"
                  :loading="formAction.formProcess"
                >
                  <template v-slot:loader>
                    <v-progress-circular indeterminate color="white" size="20" />
                  </template>
                  <span class="btn-text">Sign Up</span>
                </v-btn>

                <!-- Already have an account -->
                <v-card-text class="text-center mt-6">
                  <RouterLink class="router-link text-primary" to="/">
                    Already have an account? Log in <v-icon icon="mdi-chevron-right"></v-icon>
                  </RouterLink>
                </v-card-text>

                <!-- Footer -->
                <v-card-text class="text-center mt-6">
                  <small>© 2025 AR-ADMIN. All rights reserved.</small>
                </v-card-text>
              </v-card-text>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url('@/assets/signup-bg.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative; /* Ensure alerts can be positioned absolutely within this container */
}

.signup-row {
  width: 100%;
  max-width: 1400px;
}

.signup-card {
  width: 100%;
  max-width: 480px; /* Increased width from 400px to 480px */
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95); /* Semi-transparent white for readability */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid transparent;
  border-image: linear-gradient(45deg, #6b48ff, #00d2ff) 1;
  opacity: 0;
  transform: translateY(50px);
  transition:
    opacity 0.6s ease-out,
    transform 0.6s ease-out;
}

.animate-form {
  opacity: 1;
  transform: translateY(0);
}

.custom-input :deep(input) {
  color: #333 !important;
}

.custom-input :deep(.v-field) {
  border-radius: 8px;
}

.custom-input :deep(::placeholder) {
  color: rgba(0, 0, 0, 0.5) !important;
}

.router-link {
  text-decoration: none !important;
  font-weight: 500;
}

.router-link:hover,
.router-link:focus,
.router-link:active {
  text-decoration: none !important;
}

/* Button styling */
v-btn {
  background: linear-gradient(45deg, #6b48ff, #00d2ff);
  color: white !important;
}

.btn-text {
  position: relative;
  z-index: 1;
}

v-btn:hover {
  background: linear-gradient(45deg, #5a3de6, #00b5e2);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .signup-card {
    max-width: 100%;
    min-width: 300px; /* Adjusted from 280px to 300px for consistency with wider form */
    padding: 20px;
    border-radius: 12px;
  }
  .custom-input {
    font-size: 14px;
  }
  .text-h4 {
    font-size: 1.5rem !important;
  }
}

@media (max-width: 360px) {
  .signup-card {
    min-width: 280px; /* Adjusted from 260px to 280px for better readability */
    padding: 16px;
  }
}
</style>
