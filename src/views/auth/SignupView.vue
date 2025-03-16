<script setup>
import { ref } from 'vue'

// Theme toggle
const theme = ref('light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Form state
const form = ref()
const agreement = ref(false)
const dialog = ref(false)
const email = ref('')
const isValid = ref(false)
const isLoading = ref(false)
const password = ref('')
const phone = ref('')
const userType = ref('')

// Validation rules
const rules = {
  email: (v) => !!(v || '').match(/@/) || 'Please enter a valid email',
  length: (len) => (v) => (v || '').length >= len || `Must be at least ${len} characters`,
  password: (v) =>
    !!(v || '').match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/) ||
    'Password must contain an uppercase letter, a number, and a special character',
  required: (v) => !!v || 'This field is required',
}

// Reset form
function resetForm() {
  password.value = ''
  phone.value = ''
  email.value = ''
  userType.value = ''
  agreement.value = false
  dialog.value = false
  isValid.value = false
}
</script>

<template>
  <v-app :theme="theme">
    <v-container class="fill-height d-flex flex-column justify-center align-center">

      <!-- Theme Toggle Button -->
      <v-app-bar class="px-3" color Gray dark>
        <v-spacer></v-spacer>
        <v-btn
          :prepend-icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          text
          slim
          @click="toggleTheme"
        ></v-btn>
      </v-app-bar>

      <!-- Sign Up Form -->
      <v-card class="mx-auto" style="max-width: 500px">
        <v-toolbar color="black" cards dark flat>
          <v-btn icon>
            <RouterLink to="/"><v-icon icon="mdi-chevron-left"></v-icon></RouterLink>
          </v-btn>
          <v-card-title class="text-h6 font-weight-regular"> Sign Up </v-card-title>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </v-toolbar>

        <v-form ref="form" v-model="isValid" class="pa-4 pt-6">
          <v-text-field
            v-model="password"
            :rules="[rules.password, rules.length(6)]"
            color="deep-purple"
            counter="6"
            label="Password"
            style="min-height: 96px"
            type="password"
            variant="filled"
          ></v-text-field>

          <v-text-field
            v-model="phone"
            color="deep-purple"
            label="Phone number"
            variant="filled"
          ></v-text-field>

          <v-text-field
            v-model="email"
            :rules="[rules.email]"
            color="deep-purple"
            label="Email address"
            type="email"
            variant="filled"
          ></v-text-field>

          <v-select
            v-model="userType"
            :items="['Admin', 'Moderator', 'Staff']"
            color="deep-purple"
            label="User Type"
            variant="filled"
          ></v-select>

          <v-checkbox v-model="agreement" :rules="[rules.required]" color="deep-purple">
            <template v-slot:label>
              I agree to the&nbsp;
              <a href="#" @click.stop.prevent="dialog = true">Terms of Service</a>
              &nbsp;and&nbsp;
              <a href="#" @click.stop.prevent="dialog = true">Privacy Policy</a>*
            </template>
          </v-checkbox>
        </v-form>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn variant="text" @click="resetForm()"> Clear </v-btn>
          <v-spacer></v-spacer>
          <v-btn :disabled="!isValid" :loading="isLoading" color="deep-purple-accent-4"> Submit </v-btn>
        </v-card-actions>

        <!-- Terms of Service Dialog -->
        <v-dialog v-model="dialog" max-width="400" persistent>
          <v-card>
            <v-card-title class="text-h5 bg-grey-lighten-3"> Legal </v-card-title>
            <v-card-text> </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn variant="text" @click="agreement = false; dialog = false"> No </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="deep-purple" variant="tonal" @click="agreement = true; dialog = false">
                Yes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-card>
    </v-container>
  </v-app>
</template>
