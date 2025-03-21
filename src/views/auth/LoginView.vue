<script setup>
import { ref } from 'vue'

// Toggle password visibility
const visible = ref(false)
</script>

<template>
  <v-app>
    <v-container fluid class="login-container">
      <v-row no-gutters class="fill-height">
        <!-- ✅ Left Side - Full Background Image -->
        <v-col cols="7" class="background-image"></v-col>

        <!-- ✅ Right Side - Strong Dark Blue Login Form -->
        <v-col cols="5" class="d-flex align-center justify-center">
          <v-card class="login-card">
            <v-img
              class="mx-auto my-6"
              max-width="120"
              src="@/assets/ar-navigation-logo.png"
            ></v-img>

            <v-card-title class="text-h5 text-center text-white">Log In</v-card-title>

            <v-card-text>
              <div class="text-subtitle-1 text-white">Account</div>
              <v-text-field
                density="compact"
                placeholder="Email address"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                class="custom-input"
              ></v-text-field>

              <div class="text-subtitle-1 d-flex align-center justify-space-between text-white">
                Password
                <a class="text-caption text-decoration-none text-blue" href="#"> Forgot password? </a>
              </div>

              <v-text-field
                v-model="password"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                :type="visible ? 'text' : 'password'"
                density="compact"
                placeholder="Enter your password"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                class="custom-input"
                @click:append-inner="visible = !visible"
              ></v-text-field>

              <v-card color="surface-variant" variant="tonal">
                <v-card-text class="text-white text-caption">
                  Warning: After 3 failed login attempts, your account will be temporarily locked for 3 hours.
                </v-card-text>
              </v-card>

              <!-- ✅ Login Button - No color change or underline -->
              <v-btn color="blue" size="large" variant="tonal" block>
                <RouterLink class="router-link" to="/dashboard">Log In</RouterLink>
              </v-btn>

              <!-- ✅ Signup Link - No color change or underline -->
              <v-card-text class="text-center mt-4">
                <RouterLink class="router-link text-blue" to="/signup">
                  Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
                </RouterLink>
              </v-card-text>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
/* ✅ Fullscreen container */
.login-container {
  height: 100vh;
}

/* ✅ Left Side - Full Background Image */
.background-image {
  background: url('@/assets/ar-navigation-bg.jpg') no-repeat center center;
  background-size: cover;
  height: 100vh;
}

/* ✅ Right Side - Strong Dark Blue Floating Login Card */
.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 10px;
  background: rgba(0, 32, 96, 0.95); /* ✅ Strong Dark Blue */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

/* ✅ Custom Input Fields */
.custom-input :deep(input) {
  color: #ffffff !important; /* ✅ White text when typing */
}

.custom-input :deep(::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important; /* ✅ Light gray placeholder */
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
