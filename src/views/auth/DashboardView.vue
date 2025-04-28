<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, isAuthenticated } from '@/utils/supabase'


// Router for redirection
const router = useRouter()

// Sidebar state
const drawer = ref(false)

// Loading state
const loading = ref(true)

// User profile data
const userProfile = ref({
  fullName: 'John Lester Curro',
  role: 'Administrator',
})

// Dashboard metrics (to be fetched dynamically)
const metrics = ref({
  liveUsers: 42,
  mapInteractions: 120,
  visitedHotspots: 385,
})

// Recent activities (to be fetched dynamically)
const recentActivities = ref([
  { icon: 'mdi-account-plus', color: 'blue', text: 'John added a new hotspot in the Admin Building.' },
  { icon: 'mdi-check-circle', color: 'green', text: 'User Maria finished her AR navigation session.' },
])

// Notifications (static for now, can be fetched similarly)
const notifications = ref([
  { icon: 'mdi-check-circle', color: 'green', text: 'New user joined the AR tour.' },
  { icon: 'mdi-map-marker', color: 'blue', text: 'Hotspot "Lab 301" was visited.' },
])

// Navbar Links
const links = [
  { title: 'Dashboard', path: '/' },
  { title: 'Profile', path: '/profile' },
  { title: 'User Management', path: '/users' },
]

// Sidebar Items
const sidebarItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard', path: '/' },
  { title: 'Reports', icon: 'mdi-file-chart', path: '/reports' },
  { title: 'User Management', icon: 'mdi-account-group', path: '/users' },
  { title: 'Settings', icon: 'mdi-cog', path: '/settings' },
  { title: 'Logout', icon: 'mdi-logout', path: '/logout' },
]

// Check authentication and load data on mount
onMounted(async () => {
  // Check if user is authenticated
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    router.push('/login')
    return
  }

  // Fetch user profile
  await fetchUserProfile()

  // Fetch dashboard data
  await fetchDashboardData()

  // Set loading to false once data is loaded
  loading.value = false
})

// Fetch user profile from Supabase
const fetchUserProfile = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    if (user) {
      // Fetch additional user data from a profiles table (assumed structure)
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (data) {
        userProfile.value.fullName = data.full_name || 'John Lester Curro'
        userProfile.value.role = data.role || 'Administrator'
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error.message)
  }
}

// Fetch dashboard metrics and recent activities
const fetchDashboardData = async () => {
  try {
    // Fetch metrics (example: from a 'metrics' table)
    const { data: metricsData, error: metricsError } = await supabase
      .from('metrics')
      .select('live_users, map_interactions, visited_hotspots')
      .single()

    if (metricsError) throw metricsError

    if (metricsData) {
      metrics.value.liveUsers = metricsData.live_users || 42
      metrics.value.mapInteractions = metricsData.map_interactions || 120
      metrics.value.visitedHotspots = metricsData.visited_hotspots || 385
    }

    // Fetch recent activities (example: from an 'activities' table)
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('icon, color, text')
      .order('created_at', { ascending: false })
      .limit(2)

    if (activitiesError) throw activitiesError

    if (activitiesData && activitiesData.length > 0) {
      recentActivities.value = activitiesData
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message)
  }
}
</script>

<template>
  <v-app>
    <!-- Show loading spinner while data is being fetched -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

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
              <v-card-title class="text-center">{{ userProfile.fullName }}</v-card-title>
              <v-card-subtitle class="text-center">{{ userProfile.role }}</v-card-subtitle>
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
                <v-list-item v-for="(notification, index) in notifications" :key="index">
                  <v-icon :color="notification.color">{{ notification.icon }}</v-icon>
                  {{ notification.text }}
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- AR Navigation Metrics -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-4">
              <v-card-title>AR Navigation Metrics</v-card-title>
              <v-row>
                <v-col cols="4">
                  <v-card color="light-blue lighten-4" class="pa-3">
                    <v-card-title>Live AR Users</v-card-title>
                    <v-card-subtitle>{{ metrics.liveUsers }} Active</v-card-subtitle>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card color="teal lighten-4" class="pa-3">
                    <v-card-title>3D Map Interactions</v-card-title>
                    <v-card-subtitle>{{ metrics.mapInteractions }} Today</v-card-subtitle>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card color="amber lighten-4" class="pa-3">
                    <v-card-title>Visited Hotspots</v-card-title>
                    <v-card-subtitle>{{ metrics.visitedHotspots }} Total</v-card-subtitle>
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
                <v-list-item v-for="(activity, index) in recentActivities" :key="index">
                  <v-icon :color="activity.color">{{ activity.icon }}</v-icon>
                  {{ activity.text }}
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
