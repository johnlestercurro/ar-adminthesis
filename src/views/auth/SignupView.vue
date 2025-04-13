<script setup>
import { ref, onMounted } from 'vue'

// Toggle password visibility
const visible = ref(false)

// Form visibility state for animation
const formVisible = ref(false)

// Trigger animation on mount
onMounted(() => {
  setTimeout(() => {
    formVisible.value = true
  }, 200) // Slight delay for smooth effect
})
</script>

<template>
  <v-app>
    <v-container fluid class="signup-container">
      <v-row class="signup-row">
        <!-- ✅ Left Side - Scrollable Sign-Up Form -->
        <v-col cols="12" md="6" class="form-section">
          <v-card
            class="signup-card"
            :class="{ 'animate-form': formVisible }"
          >
            <v-card-title class="text-h5 text-center text-primary">Sign Up</v-card-title>
            <v-card-text>
              <!-- Email -->
              <div class="text-subtitle-1 text-dark">Email Address</div>
              <v-text-field
                density="compact"
                placeholder="Enter your email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                class="custom-input"
              ></v-text-field>

              <!-- Phone Number -->
              <div class="text-subtitle-1 text-dark">Phone Number</div>
              <v-text-field
                density="compact"
                placeholder="Enter your phone number"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
                class="custom-input"
              ></v-text-field>

              <!-- Password -->
              <div class="text-subtitle-1 text-dark">Password</div>
              <v-text-field
                v-model="password"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="compact"
                placeholder="Create a strong password"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                class="custom-input"
                @click:append-inner="visible = !visible"
              ></v-text-field>

              <!-- User Type Selection -->
              <div class="text-subtitle-1 text-dark">User Type</div>
              <v-select
                :items="['Admin', 'Moderator', 'Staff']"
                placeholder="Select your role"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                class="custom-input"
              ></v-select>

              <!-- Terms & Agreement Checkbox -->
              <v-checkbox class="text-dark">
                <template v-slot:label>
                  <span class="text-dark">
                    I agree to the
                    <a class="text-primary text-decoration-none" href="#">Terms & Privacy Policy</a>
                  </span>
                </template>
              </v-checkbox>

              <!-- ✅ Sign Up Button -->
              <v-btn color="primary" size="large" variant="tonal" block>
                Sign Up
              </v-btn>

              <!-- ✅ Already Have an Account? -->
              <v-card-text class="text-center mt-4">
                <RouterLink class="router-link text-primary" to="/login">
                  Already have an account? Log in <v-icon icon="mdi-chevron-right"></v-icon>
                </RouterLink>
              </v-card-text>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ✅ Right Side - Fixed Background Image -->
        <v-col cols="12" md="6" class="image-section"></v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
/* ✅ Fullscreen Container */
.signup-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

/* ✅ Left Side - Full Height Scrollable Sign-Up Form */
.form-section {
  height: 100vh;
  overflow-y: auto;
  padding: 40px;
  background: #80919e; /* ✅ Light Gray for a clean professional look */
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

/* ✅ Floating Sign-Up Card */
.signup-card {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  border-radius: 12px;
  background: white; /* ✅ Changed to White for Professional Look */
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); /* ✅ Subtle Shadow for depth */
  opacity: 0;
  transform: translateY(50px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* ✅ Triggered Animation */
.animate-form {
  opacity: 1;
  transform: translateY(0);
}

/* ✅ Right Side - Fullscreen Background Image */
.image-section {
  height: 100vh;
  background: url('@/assets/signup-bg.jpg') no-repeat center center;
  background-size: cover;
  position: fixed;
  right: 0;
  top: 0;
  width: 50%;
}

/* ✅ Custom Input Fields */
.custom-input :deep(input) {
  color: #333 !important; /* ✅ Dark Gray for readability */
}

.custom-input :deep(::placeholder) {
  color: rgba(0, 0, 0, 0.5) !important; /* ✅ Subtle Gray Placeholder */
}

/* ✅ Prevents color change & removes underline from buttons and links */
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
