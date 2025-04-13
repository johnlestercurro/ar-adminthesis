<script setup>
import { ref } from 'vue'

// Sidebar state
const drawer = ref(false)

// Navbar Links
const links = [
  { title: 'Dashboard', path: '/' },
  { title: 'Messages', path: '/messages' },
  { title: 'Profile', path: '/profile' },
  { title: 'About Us', path: '/aboutus' },
  { title: 'User Management', path: 'users'},
]

// Sidebar Items
const sidebarItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard', path: '/' },
  { title: 'Reports', icon: 'mdi-file-chart', path: '/reports' },
  { title: 'User Management', icon: 'mdi-account-group', path: '/users' },
  { title: 'Settings', icon: 'mdi-cog', path: '/settings' },
  { title: 'Logout', icon: 'mdi-logout', path: '/logout' }
]
</script>

<template>
  <v-app>
    <!-- Navbar -->
    <v-app-bar flat color="#2E5AAC">
      <v-container class="d-flex align-center justify-space-between">
        <v-btn icon @click="drawer = !drawer" color="white">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <div class="d-flex align-center">
          <v-avatar class="me-3" color="blue-grey darken-3" size="40"></v-avatar>
          <RouterLink
            v-for="link in links"
            :key="link.title"
            :to="link.path"
            class="nav-link"
          >
            {{ link.title }}
          </RouterLink>
        </div>

        <v-spacer></v-spacer>

        <v-responsive max-width="200">
          <v-text-field
            density="compact"
            label="Search"
            rounded="lg"
            variant="solo-filled"
            flat
            hide-details
            single-line
            class="custom-input"
          ></v-text-field>
        </v-responsive>
      </v-container>
    </v-app-bar>

    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" temporary color="#1A2B4C">
      <v-list>
        <RouterLink
          v-for="(item, index) in sidebarItems"
          :key="index"
          :to="item.path"
          class="sidebar-link"
        >
          <v-list-item link class="py-3 text-white">
            <template v-slot:prepend>
              <v-icon color="blue-grey lighten-3">{{ item.icon }}</v-icon>
            </template>
            {{ item.title }}
          </v-list-item>
        </RouterLink>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="bg-dashboard">
      <v-container>
        <v-row>
          <!-- Profile Widget -->
          <v-col cols="12" md="4">
            <v-card class="profile-card pa-4">
              <v-avatar size="80" class="mx-auto mb-3" color="blue-grey darken-3"></v-avatar>
              <v-card-title class="text-center">John Lester Curro</v-card-title>
              <v-card-subtitle class="text-center">Administrator</v-card-subtitle>
            </v-card>
          </v-col>

          <!-- Quick Actions -->
          <v-col cols="12" md="4">
            <v-card class="pa-4">
              <v-card-title>Quick Actions</v-card-title>
              <v-btn block color="primary" class="mb-2">View AR Sessions</v-btn>
              <v-btn block color="secondary">Manage Hotspots</v-btn>
            </v-card>
          </v-col>

          <!-- Notifications -->
          <v-col cols="12" md="4">
            <v-card class="pa-4">
              <v-card-title>Notifications</v-card-title>
              <v-list density="compact">
                <v-list-item>
                  <v-icon color="green">mdi-check-circle</v-icon>
                  New user joined the AR tour.
                </v-list-item>
                <v-list-item>
                  <v-icon color="blue">mdi-map-marker</v-icon>
                  Hotspot "Lab 301" was visited.
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- Replaced Analytics Panel -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title>AR Navigation Metrics</v-card-title>
              <v-row>
                <v-col cols="4">
                  <v-card color="light-blue lighten-4" class="pa-3">
                    <v-card-title>Live AR Users</v-card-title>
                    <v-card-subtitle>42 Active</v-card-subtitle>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card color="teal lighten-4" class="pa-3">
                    <v-card-title>3D Map Interactions</v-card-title>
                    <v-card-subtitle>120 Today</v-card-subtitle>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card color="amber lighten-4" class="pa-3">
                    <v-card-title>Visited Hotspots</v-card-title>
                    <v-card-subtitle>385 Total</v-card-subtitle>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activities -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title>Recent Activities</v-card-title>
              <v-list>
                <v-list-item>
                  <v-icon color="blue">mdi-account-plus</v-icon>
                  John added a new hotspot in the Admin Building.
                </v-list-item>
                <v-list-item>
                  <v-icon color="green">mdi-check-circle</v-icon>
                  User Maria finished her AR navigation session.
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- VR/AR Deployment Area -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title>Deploy VR Experience</v-card-title>
              <v-card-text>
                <!-- Placeholder for your Supabase/VR integration -->
                <v-file-input
                  label="Upload VR Scene"
                  accept=".glb,.gltf,.fbx"
                  prepend-icon="mdi-vr"
                  class="mb-3"
                ></v-file-input>
                <v-btn color="primary" block>Deploy to Supabase</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.bg-dashboard {
  background-color: #F4F6FA;
}
.custom-input input {
  background: rgba(0, 0, 0, 0.05);
  color: black;
  border-radius: 8px;
}
.v-list-item {
  transition: background 0.2s ease-in-out;
}
.v-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
.nav-link {
  margin: 0 10px;
  text-decoration: none !important;
  color: white;
  font-weight: 500;
}
.nav-link:hover,
.nav-link:focus,
.nav-link:active {
  text-decoration: none !important;
  color: #FFD700;
}
.sidebar-link {
  text-decoration: none;
  color: white;
}
.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.1);
}
.profile-card {
  text-align: center;
}
</style>
