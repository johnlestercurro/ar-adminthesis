<script setup>
import { ref } from 'vue'

const visible = ref(false)
const formVisible = ref(false)

setTimeout(() => {
  formVisible.value = true
}, 200)
</script>

<template>
  <v-app>
    <v-container fluid class="login-container pa-0">
      <v-row class="fill-height">
        <!-- ✅ Left Side Background Image -->
        <v-col
          cols="12"
          md="7"
          class="d-none d-md-flex background-image"
        ></v-col>

        <!-- ✅ Right Side Login Form -->
        <v-col
          cols="12"
          md="5"
          class="d-flex align-center justify-center"
        >
          <transition name="fade-slide">
            <v-card
              v-if="formVisible"
              class="login-card"
            >
              <v-img
                class="mx-auto my-6"
                max-width="120"
                src="@/assets/ar-navigation-logo.png"
              />

              <v-card-title class="text-h5 text-center text-white">
                Log In
              </v-card-title>

              <v-card-text>
                <div class="text-subtitle-1 text-white">Account</div>
                <v-text-field
                  density="compact"
                  placeholder="Email address"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  class="custom-input"
                />

                <div class="text-subtitle-1 d-flex align-center justify-space-between text-white">
                  Password
                  <a class="text-caption text-decoration-none text-blue" href="#">Forgot password?</a>
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
                />

                <v-card color="surface-variant" variant="tonal">
                  <v-card-text class="text-white text-caption">
                    Warning: After 3 failed login attempts, your account will be temporarily locked for 3 hours.
                  </v-card-text>
                </v-card>

                <v-btn color="blue" size="large" variant="tonal" block>
                  <RouterLink class="router-link" to="/dashboard">Log In</RouterLink>
                </v-btn>

                <v-card-text class="text-center mt-4">
                  <RouterLink class="router-link text-blue" to="/signup">
                    Sign up now <v-icon icon="mdi-chevron-right"></v-icon>
                  </RouterLink>
                </v-card-text>
              </v-card-text>
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

/* ✅ Background Image on Left */
.background-image {
  background-image: url('@/assets/ar-navigation-bg.jpg');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  min-height: 100vh;
}

/* ✅ Responsive Login Card */
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 30px;
  border-radius: 10px;
  background: rgba(0, 32, 96, 0.95);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

/* ✅ Inputs */
.custom-input :deep(input) {
  color: #ffffff !important;
}

.custom-input :deep(::placeholder) {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* ✅ Remove underline / color change */
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

/* ✅ Animation */
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

/* ✅ Small screen layout fix */
@media (max-width: 960px) {
  .login-card {
    margin-top: 30px;
    margin-bottom: 30px;
  }
}
</style>
