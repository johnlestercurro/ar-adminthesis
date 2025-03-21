<script setup>
import { ref, watchEffect } from 'vue'
import { useTheme } from 'vuetify'

// Vuetify Theme Management
const theme = ref('light')
const vuetifyTheme = useTheme()

watchEffect(() => {
  vuetifyTheme.global.name.value = theme.value
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Sidebar state
const drawer = ref(false)

// Form state
const form = ref()
const agreement = ref(false)
const dialog = ref(false)
const email = ref('')
const phone = ref('')
const password = ref('')
const userType = ref('')
const isValid = ref(false)
const isLoading = ref(false)

// Validation rules
const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => !!(v || '').match(/^[^@]+@[^@]+\.[^@]+$/) || 'Enter a valid email',
  length: (len) => (v) => (v || '').length >= len || `Must be at least ${len} characters`,
  password: (v) =>
    !!(v || '').match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/) ||
    'Password must contain an uppercase letter, a number, and a special character',
}

// Reset form
function resetForm() {
  email.value = ''
  phone.value = ''
  password.value = ''
  userType.value = ''
  agreement.value = false
  dialog.value = false
  isValid.value = false
}
</script>

<template>
  <v-app :theme="theme">
    <!-- App Bar -->
    <v-app-bar color="primary" density="compact">
      <!-- Menu Button (Opens Sidebar) -->
      <v-btn icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <!-- Theme Toggle -->
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Sidebar (Temporary Drawer) -->
    <v-navigation-drawer v-model="drawer" temporary app>
      <v-list density="compact">
        <v-list-item prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="Profile"></v-list-item>
        <v-list-item prepend-icon="mdi-settings" title="Settings"></v-list-item>
        <v-divider></v-divider>
        <v-list-item prepend-icon="mdi-logout" title="Logout"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-container class="fill-height d-flex flex-column align-center justify-start">
      <!-- Sign Up Title -->
      <div class="w-100 px-4 mt-12">
        <h2 class="text-h4 font-weight-bold text-left" style="color: #333; font-family: 'Roboto', sans-serif;">
          Sign Up
        </h2>
      </div>

      <!-- Form Box (Unchanged & Lowered for Space) -->
      <v-card class="mx-auto px-5 py-6 mt-6" elevation="10" style="max-width: 500px">
        <div class="d-flex justify-center mb-5">
          <v-img src="/your-logo.png" max-height="80" contain></v-img>
        </div>

        <v-form ref="form" v-model="isValid" class="mt-2">
          <!-- Email First -->
          <v-text-field
            v-model="email"
            :rules="[rules.required, rules.email]"
            color="primary"
            label="Email Address"
            type="email"
            variant="outlined"
          ></v-text-field>

          <!-- Phone Number Second -->
          <v-text-field
            v-model="phone"
            :rules="[rules.required]"
            color="primary"
            label="Phone Number"
            type="tel"
            variant="outlined"
          ></v-text-field>

          <!-- Password Third -->
          <v-text-field
            v-model="password"
            :rules="[rules.required, rules.password, rules.length(6)]"
            color="primary"
            counter="6"
            label="Password"
            type="password"
            variant="outlined"
          ></v-text-field>

          <!-- User Type Last -->
          <v-select
            v-model="userType"
            :rules="[rules.required]"
            :items="['Admin', 'Moderator', 'Staff']"
            color="primary"
            label="User Type"
            variant="outlined"
          ></v-select>

          <v-checkbox v-model="agreement" :rules="[rules.required]" color="primary">
            <template v-slot:label>
              I agree to the&nbsp;
              <a href="#" @click.stop.prevent="dialog = true">Terms of Service</a>
              &nbsp;and&nbsp;
              <a href="#" @click.stop.prevent="dialog = true">Privacy Policy</a>*
            </template>
          </v-checkbox>

          <v-divider class="my-4"></v-divider>

          <v-card-actions>
            <v-btn variant="outlined" @click="resetForm()">Clear</v-btn>
            <v-spacer></v-spacer>
            <v-btn :disabled="!isValid" :loading="isLoading" color="primary">Submit</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-container>

    <!-- Terms of Service Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5 bg-grey-lighten-3">Legal</v-card-title>
        <v-card-text> Please review our Terms of Service and Privacy Policy. </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn variant="text" @click="agreement = false; dialog = false"> No </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="tonal" @click="agreement = true; dialog = false"> Yes </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>
