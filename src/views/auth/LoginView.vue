<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue';
import { ref } from 'vue';
import { requiredValidator, emailValidator } from '@/utils/validators';
import { supabase, formActionDefault } from '@/utils/supabase'; // Main Supabase client
import { useRouter } from 'vue-router';

const isPasswordVisible = ref(false);
const refVForm = ref();

// Form data
const formDataDefault = {
  email: '',
  password: '',
};

const formData = ref({ ...formDataDefault });

// Alert notification states
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const formAction = ref({ ...formActionDefault });

// Router for redirection after login
const router = useRouter();

// Regular email/password login
const onSubmit = async () => {
  formAction.value = { ...formActionDefault, formProcess: true };
  console.log('Attempting login with email:', formData.value.email);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password,
    });
    if (error) throw error;

    console.log('Login successful for email:', formData.value.email);
    formAction.value = {
      formProcess: false,
      formStatus: 200,
      formSuccessMessage: 'Login successful!',
      formErrorMessage: '',
    };
    showSuccessAlert.value = true;
    formData.value = { ...formDataDefault };
    router.push('/dashboard');
  } catch (error) {
    console.error('Error during login:', error.message);
    formAction.value = {
      formProcess: false,
      formStatus: 400,
      formErrorMessage: error.message || 'Login failed. Please try again.',
      formSuccessMessage: '',
    };
    showErrorAlert.value = true;
  }
};

// NEW: Sign in with Google
const signInWithGoogle = async () => {
  formAction.value = { ...formActionDefault, formProcess: true };
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // Redirect to dashboard after login
      },
    });
    if (error) throw error;
    // No need to handle success here — Supabase redirects automatically
  } catch (error) {
    console.error('Google login error:', error.message);
    formAction.value = {
      formProcess: false,
      formErrorMessage: error.message || 'Google login failed.',
    };
    showErrorAlert.value = true;
  }
};

// Form submission handler
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit();
  });
};
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
                    <RouterLink class="text-caption text-decoration-none text-blue" to="/reset-password">
                      Forgot password?
                    </RouterLink>
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

                  <v-card color="surface-variant" variant="tonal" class="mb-4">
                    <v-card-text class="text-white text-caption">
                      Warning: After 3 failed login attempts, your account will be temporarily locked for 3 hours.
                    </v-card-text>
                  </v-card>

                  <!-- Regular Login Button -->
                  <v-btn
                    type="submit"
                    color="blue"
                    size="large"
                    variant="tonal"
                    block
                    class="mb-4"
                    :loading="formAction.formProcess"
                  >
                    Log In
                  </v-btn>

                  <!-- NEW: Google Sign-In Button -->
                  <v-btn
                    @click="signInWithGoogle"
                    color="white"
                    size="large"
                    variant="outlined"
                    block
                    class="google-btn"
                    :loading="formAction.formProcess"
                  >
                    <v-img
                      src="https://developers.google.com/identity/images/g-logo.png"
                      width="20"
                      height="20"
                      class="mr-3"
                    />
                    Sign in with Google
                  </v-btn>

                  <v-card-text class="text-center mt-6">
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
/* Your existing styles remain unchanged */

.google-btn {
  border: 1px solid #dadce0 !important;
  color: #3c4043 !important;
  background-color: white !important;
}

.google-btn:hover {
  background-color: #f8f9fa !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Rest of your styles... */
</style>
