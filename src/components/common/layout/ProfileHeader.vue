<script setup>
defineProps({
  fullName: String,
  role: String,
  initials: String,
  profilePicture: String,
  logout: Function,
});
</script>

<template>
  <div class="d-flex align-center">
    <v-avatar size="40" class="mr-2">
      <img
        v-if="profilePicture"
        :src="profilePicture"
        alt="Profile Picture"
        class="profile-image"
      />
      <span v-else>{{ initials }}</span>
    </v-avatar>
    <div class="d-none d-md-block mr-2">
      <div>{{ fullName }}</div>
      <div class="text-caption">{{ role }}</div>
    </div>
    <v-btn icon @click="logout">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.v-avatar {
  background: #4CAF50;
  color: white;
  overflow: hidden;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}
</style>
