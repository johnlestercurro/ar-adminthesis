<script setup>
import { ref } from 'vue'

const user = ref({
  name: 'John Lester Curro',
  role: 'Administrator',
  email: 'johnlester@example.com',
  phone: '+63 912 345 6789',
  profilePicture: '/default-avatar.png', // Default avatar image
  darkMode: false,
  notifications: true
})

// Handle profile picture upload
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      user.value.profilePicture = reader.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <v-container class="profile-container">
    <v-row>
      <!-- ✅ Left Column: Profile Details -->
      <v-col cols="12" md="4">
        <v-card class="pa-4 profile-card" elevation="6">
          <v-card-title class="text-center">Profile</v-card-title>
          <v-divider></v-divider>

          <!-- Profile Picture Upload -->
          <div class="d-flex flex-column align-center mt-3">
            <v-avatar size="100" class="profile-avatar">
              <img :src="user.profilePicture" alt="Profile Picture">
            </v-avatar>
            <v-btn class="mt-2 upload-btn" color="primary" variant="tonal">
              Upload New
              <input type="file" accept="image/*" @change="handleFileUpload" class="file-input">
            </v-btn>
          </div>
        </v-card>
      </v-col> <!-- ✅ Closing tag added -->

      <!-- ✅ Right Column: Account Settings -->
      <v-col cols="12" md="8">
        <v-card class="pa-4 fade-in" elevation="6">
          <v-card-title>Account Settings</v-card-title>
          <v-divider></v-divider>

          <!-- Change Password -->
          <div class="mt-3">
            <v-text-field label="Current Password" type="password" variant="outlined"></v-text-field>
            <v-text-field label="New Password" type="password" variant="outlined"></v-text-field>
            <v-btn color="primary" variant="tonal">Change Password</v-btn>
          </div>

          <!-- Preferences -->
          <div class="mt-5">
            <v-card-subtitle>Preferences</v-card-subtitle>
            <v-switch v-model="user.darkMode" label="Enable Dark Mode" inset></v-switch>
            <v-switch v-model="user.notifications" label="Receive Email Notifications" inset></v-switch>
          </div>
        </v-card>

        <!-- ✅ Activity Log -->
        <v-card class="pa-4 mt-4 fade-in" elevation="6">
          <v-card-title>Recent Activity</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="blue">mdi-login</v-icon>
              </template>
              Logged in from IP: 192.168.1.100
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="green">mdi-check-circle</v-icon>
              </template>
              Updated profile picture
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="red">mdi-lock-reset</v-icon>
              </template>
              Changed password
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* ✅ Gradient Background */
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2E5AAC, #1A2B4C);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* ✅ Profile Card */
.profile-card {
  text-align: center;
  background: white; /* Keeping form background white */
  border-radius: 12px;
  transition: transform 0.3s ease-in-out;
}
.profile-card:hover {
  transform: scale(1.02);
}

/* ✅ Profile Avatar */
.profile-avatar {
  transition: transform 0.3s ease-in-out;
}
.profile-avatar:hover {
  transform: scale(1.1);
}

/* ✅ Fade-in Effect */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ✅ Upload Button Styling */
.upload-btn {
  position: relative;
  overflow: hidden;
}
.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  left: 0;
  top: 0;
}
</style>
