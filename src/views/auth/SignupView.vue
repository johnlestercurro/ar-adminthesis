<script setup>
import { ref, reactive, onMounted } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'
import { supabase, formActionDefault } from '@/utils/supabase.js'
import AlertNotification from '@/components/common/AlertNotification.vue'

// UI states
const visible = ref(false)
const formVisible = ref(false)
const refVForm = ref()

const formDataDefault = {
  email: '',
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
})

// Validators
const phoneValidator = (value) => {
  return /^\d{7,15}$/.test(value) || 'Enter a valid phone number'
}

const passwordValidator = (value) => {
  return (value && value.length >= 6) || 'Password must be at least 6 characters'
}

// Submit Handler
const onFormSubmit = () => {
  refVForm.value?.validate().then(async ({ valid }) => {
    if (valid) {
      try {
        formAction.formProcess = true
        formAction.formErrorMessage = ''
        formAction.formSuccessMessage = ''

        const { error } = await supabase.auth.signUp({
          email: formData.value.email,
          password: formData.value.password,
          options: {
            data: {
              phone: formData.value.phone,
              role: formData.value.role,
            },
          },
        })

        if (error) throw error

        // Success
        formAction.formSuccessMessage = 'Registration successful!'
        showSuccessAlert.value = true

        // Debug log to confirm state change
        console.log('Success State:', {
          showSuccessAlert: showSuccessAlert.value,
          formSuccessMessage: formAction.formSuccessMessage,
        })

        // Clear form
        Object.assign(formData.value, { ...formDataDefault })
        refVForm.value.resetValidation()

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          showSuccessAlert.value = false
          formAction.formSuccessMessage = '' // Clear message to prevent re-display
          console.log('Success Alert Hidden:', {
            showSuccessAlert: showSuccessAlert.value,
            formSuccessMessage: formAction.formSuccessMessage,
          })
        }, 5000)
      } catch (err) {
        formAction.formErrorMessage = err.message
        showErrorAlert.value = true

        // Debug log for error state
        console.log('Error State:', {
          showErrorAlert: showErrorAlert.value,
          formErrorMessage: formAction.formErrorMessage,
        })

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          showErrorAlert.value = false
          formAction.formErrorMessage = '' // Clear message to prevent re-display
          console.log('Error Alert Hidden:', {
            showErrorAlert: showErrorAlert.value,
            formErrorMessage: formAction.formErrorMessage,
          })
        }, 5000)
      } finally {
        formAction.formProcess = false
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
                  <RouterLink class="router-link text-primary" to="/login">
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
