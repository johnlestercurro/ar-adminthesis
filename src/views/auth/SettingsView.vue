<script setup>
import { ref } from 'vue'

// User Information
const username = ref('JohnDoe')
const email = ref('johndoe@example.com')
const password = ref('')

// Settings States
const darkMode = ref(false)
const emailNotifications = ref(true)
const pushNotifications = ref(false)

// Functions
const updateProfile = () => {
  alert('Profile updated successfully!')
}
const updateSettings = () => {
  alert('Settings saved successfully!')
}
const deleteAccount = () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    alert('Account deleted successfully.')
  }
}
</script>

<template>
  <v-container fluid class="settings-container">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-5" color="white" elevation="3">
          <v-card-title class="text-h5 font-weight-bold text-black">Settings</v-card-title>
          <v-divider class="my-4"></v-divider>

          <!-- ✅ User Profile Settings -->
          <v-card-subtitle class="text-h6 font-weight-bold">Profile</v-card-subtitle>
          <v-text-field v-model="username" label="Username" variant="outlined"></v-text-field>
          <v-text-field v-model="email" label="Email" variant="outlined"></v-text-field>
          <v-text-field v-model="password" label="New Password" type="password" variant="outlined"></v-text-field>
          <v-btn color="primary" block @click="updateProfile">Update Profile</v-btn>

          <v-divider class="my-4"></v-divider>

          <!-- ✅ Theme Settings -->
          <v-card-subtitle class="text-h6 font-weight-bold">Appearance</v-card-subtitle>
          <v-switch v-model="darkMode" label="Enable Dark Mode"></v-switch>

          <v-divider class="my-4"></v-divider>

          <!-- ✅ Notification Settings -->
          <v-card-subtitle class="text-h6 font-weight-bold">Notifications</v-card-subtitle>
          <v-switch v-model="emailNotifications" label="Email Notifications"></v-switch>
          <v-switch v-model="pushNotifications" label="Push Notifications"></v-switch>
          <v-btn color="primary" block @click="updateSettings">Save Settings</v-btn>

          <v-divider class="my-4"></v-divider>

          <!-- ✅ Account Actions -->
          <v-card-subtitle class="text-h6 font-weight-bold">Account</v-card-subtitle>
          <v-btn color="red" block @click="deleteAccount">Delete Account</v-btn>
          <v-btn color="grey darken-3" block class="mt-2">Logout</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Background Color */
.settings-container {
  background-color: #00BCD4; /* Cyan */
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>

