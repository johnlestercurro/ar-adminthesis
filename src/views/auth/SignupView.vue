<script setup>
import { ref, onMounted } from 'vue'
import { requiredValidator, emailValidator } from '@/utils/validators'

// States
const visible = ref(false)
const formVisible = ref(false)
const refVForm = ref()

const formData = ref({
  email: '',
  phone: '',
  password: '',
  agreed: false,
  // Optional: you can hardcode this if needed for backend
  role: 'Admin',
})

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

// Submit
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) {
      console.log('Admin signup data:', formData.value)
      // API or Supabase call goes here
    }
  })
}
</script>

<template>
  <v-app>
    <v-container fluid class="signup-container">
      <v-row class="signup-row">
        <!-- ✅ Left Side - Admin Sign-Up Form -->
        <v-col cols="12" md="6" class="form-section">
          <v-card class="signup-card" :class="{ 'animate-form': formVisible }">
            <v-card-title class="text-h5 text-center text-primary">Admin Sign Up</v-card-title>

            <v-form ref="refVForm" @submit.prevent="onFormSubmit">
              <v-card-text>
                <!-- Email -->
                <div class="text-subtitle-1 text-dark">Email Address</div>
                <v-text-field
                  v-model="formData.email"
                  density="compact"
                  placeholder="Enter your email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  class="custom-input"
                  :rules="[requiredValidator, emailValidator]"
                />

                <!-- Phone Number -->
                <div class="text-subtitle-1 text-dark">Phone Number</div>
                <v-text-field
                  v-model="formData.phone"
                  density="compact"
                  placeholder="Enter your phone number"
                  prepend-inner-icon="mdi-phone-outline"
                  variant="outlined"
                  class="custom-input"
                  :rules="[requiredValidator, phoneValidator]"
                />

                <!-- Password -->
                <div class="text-subtitle-1 text-dark">Password</div>
                <v-text-field
                  v-model="formData.password"
                  :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="visible ? 'text' : 'password'"
                  density="compact"
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
                <v-btn type="submit" color="primary" size="large" variant="tonal" block>
                  Sign Up
                </v-btn>

                <!-- Already have an account -->
                <v-card-text class="text-center mt-4">
                  <RouterLink class="router-link text-primary" to="/login">
                    Already have an account? Log in <v-icon icon="mdi-chevron-right"></v-icon>
                  </RouterLink>
                </v-card-text>
              </v-card-text>
            </v-form>
          </v-card>
        </v-col>

        <!-- ✅ Right Side - Background Image -->
        <v-col cols="12" md="6" class="image-section"></v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
.signup-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.form-section {
  height: 100vh;
  overflow-y: auto;
  padding: 40px;
  background: #80919e;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.signup-card {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
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

.image-section {
  height: 100vh;
  background: url('@/assets/signup-bg.jpg') no-repeat center center;
  background-size: cover;
  position: fixed;
  right: 0;
  top: 0;
  width: 50%;
}

.custom-input :deep(input) {
  color: #333 !important;
}

.custom-input :deep(::placeholder) {
  color: rgba(0, 0, 0, 0.5) !important;
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
</style>
