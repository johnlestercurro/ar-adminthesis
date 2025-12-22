<script setup>
import { ref, reactive, onMounted } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import { useRouter } from 'vue-router'
import AlertNotification from '@/components/common/AlertNotification.vue'

const visible = ref(false)
const formVisible = ref(false)
const refVForm = ref()

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
const formAction = reactive({ ...formActionDefault })

const showSuccessAlert = ref(false)
const showErrorAlert = ref(false)

// Animation trigger + redirect if already logged in
onMounted(() => {
  // Redirect if already logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      router.push('/dashboard')
    }
  })

  setTimeout(() => {
    formVisible.value = true
  }, 200)
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

// Google Sign-Up (redirects to /auth/callback)
const signUpWithGoogle = async () => {
  formAction.formProcess = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',  // NEW: Use callback route
      },
    })
    if (error) throw error
  } catch (error) {
    console.error('Google signup error:', error.message)
    let friendlyMessage = 'Google signup failed. Please try again.'
    if (error.message.includes('popup')) {
      friendlyMessage = 'Popup blocked. Please allow popups for this site.'
    } else if (error.message.includes('network')) {
      friendlyMessage = 'Network issue. Please check your connection.'
    } else if (error.message.includes('already registered')) {
      friendlyMessage = 'This email is already registered. Please log in.'
    }
    formAction.formErrorMessage = friendlyMessage
    showErrorAlert.value = true
  } finally {
    formAction.formProcess = false
  }
}

// Form submission (email/password)
const onFormSubmit = () => {
  refVForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        formAction.formProcess = true
        formAction.formErrorMessage = ''
        formAction.formSuccessMessage = ''
        showErrorAlert.value = false
        showSuccessAlert.value = false

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

        if (error) throw error

        if (!data.user) {
          throw new Error('User registration failed: No user data returned.')
        }

        if (!data.user.confirmed_at) {
          formAction.formSuccessMessage = 'Registration successful! Please check your email to confirm.'
          showSuccessAlert.value = true
          formAction.formProcess = true // Disable form after success
        } else {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: formData.value.full_name,
              phone: formData.value.phone,
              role: formData.value.role,
            })

          if (profileError) {
            if (profileError.message.includes('constraint') || profileError.message.includes('permission')) {
              formAction.formSuccessMessage = 'Registration successful! Please confirm your email to complete setup.'
              showSuccessAlert.value = true
            } else {
              throw profileError
            }
          } else {
            formAction.formSuccessMessage = 'Registration successful! Please log in.'
            showSuccessAlert.value = true
          }
          formAction.formProcess = true // Disable form after success
        }

        Object.assign(formData.value, { ...formDataDefault })
        refVForm.value.resetValidation()
      } catch (err) {
        formAction.formErrorMessage = err.message || 'Registration failed. Please try again.'
        showErrorAlert.value = true
        showSuccessAlert.value = false
        formAction.formSuccessMessage = ''
      } finally {
        if (!showSuccessAlert.value) {
          formAction.formProcess = false
        }
      }
    }
  })
}
</script>

<template>
  <v-app>
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
        <v-col cols="12" sm="10" md="6" lg="4">
          <v-card class="signup-card" :class="{ 'animate-form': formVisible }">
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
                      <a class="text-primary text-decoration-none" href="#">Terms & Privacy Policy</a>
                    </span>
                  </template>
                </v-checkbox>

                <!-- Sign Up Button -->
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

                <!-- Google Sign-Up Button -->
                <v-btn
                  @click="signUpWithGoogle"
                  color="white"
                  size="large"
                  variant="outlined"
                  block
                  class="mt-4 google-btn"
                  :loading="formAction.formProcess"
                  :disabled="formAction.formProcess"
                >
                  <v-icon start class="mr-2">mdi-google</v-icon>
                  Sign up with Google
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
}

.signup-row {
  width: 100%;
  max-width: 1400px;
}

.signup-card {
  width: 100%;
  max-width: 480px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid transparent;
  border-image: linear-gradient(45deg, #6b48ff, #00d2ff) 1;
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
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

.google-btn {
  border-color: #dadce0 !important;
  color: #3c4043 !important;
}

.google-btn:hover {
  background-color: #f8f9fa !important;
}
</style>
