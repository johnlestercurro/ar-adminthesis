<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isAuthenticated } from '@/utils/supabase';
import AlertNotification from '@/components/common/AlertNotification.vue';
import ProfileHeader from '@/components/common/layout/ProfileHeader.vue';

const router = useRouter();
const drawer = ref(false);
const loading = ref(true);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const formAction = ref({
  formSuccessMessage: 'Success!',
  formErrorMessage: 'An error occurred.',
});
const vrFile = ref(null);

const userProfile = ref({
  fullName: 'Profile Unavailable',
  role: 'User',
  initials: '',
  profilePicture: '/default-avatar.png',
});

const metrics = ref({
  liveUsers: 0,
  mapInteractions: 0,
  visitedHotspots: 0,
});

const recentActivities = ref([]);
const notifications = ref([]);

// NEW: Weather state
const weather = ref({
  temp: null,
  description: '',
  icon: '',
  humidity: null,
  windSpeed: null,
});
const weatherLoading = ref(false);
const weatherError = ref('');

const links = [
  { title: 'Dashboard', path: '/' },
  { title: 'Profile', path: '/profile' },
  { title: 'CCIS Destinations', path: '/destinations' },
  { title: 'User Management', path: '/users' },
  { title: 'Feedback', path: '/feedback' },
];

const sidebarItems = [
  { title: 'Overview', icon: 'mdi-view-dashboard', path: '/' },
  { title: 'CCIS Destinations', icon: 'mdi-map-marker', path: '/destinations' },
  { title: 'User Management', icon: 'mdi-account-group', path: '/users' },
  { title: 'Settings', icon: 'mdi-cog', path: '/settings' },
  { title: 'Feedback', icon: 'mdi-comment-text', path: '/feedback' },
  { title: 'Logout', icon: 'mdi-logout', path: '/logout' },
];

const getAvatarText = (fullName) => {
  if (!fullName || fullName === 'Profile Unavailable') return 'PU';
  const names = fullName.trim().split(' ');
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : names[0][0].toUpperCase();
};

// NEW: Fetch weather from OpenWeatherMap API
const fetchWeather = async () => {
  weatherLoading.value = true;
  weatherError.value = '';
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error('OpenWeather API key not set in .env');

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=8.4866&lon=124.6472&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('Weather API request failed');

    const data = await response.json();
    weather.value.temp = Math.round(data.main.temp);
    weather.value.description = data.weather[0].description;
    weather.value.icon = mapWeatherIcon(data.weather[0].icon);
    weather.value.humidity = data.main.humidity;
    weather.value.windSpeed = data.wind.speed;
  } catch (error) {
    console.error('Weather fetch error:', error);
    weatherError.value = 'Could not load weather data.';
  } finally {
    weatherLoading.value = false;
  }
};

// Helper: Map OpenWeather icon codes to Vuetify icons
const mapWeatherIcon = (code) => {
  const iconMap = {
    '01d': 'mdi-weather-sunny',
    '01n': 'mdi-weather-night',
    '02d': 'mdi-weather-partly-cloudy',
    '02n': 'mdi-weather-night-partly-cloudy',
    '03d': 'mdi-weather-cloudy',
    '04d': 'mdi-weather-cloudy',
    '09d': 'mdi-weather-pouring',
    '10d': 'mdi-weather-rainy',
    '11d': 'mdi-weather-lightning',
    '13d': 'mdi-weather-snowy',
    '50d': 'mdi-weather-fog',
  };
  return iconMap[code] || 'mdi-weather-partly-cloudy';
};

const fetchUserProfile = async () => {
  console.log('Fetching user profile...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Auth user:', user, 'Error:', error);
    if (error) throw new Error(`Auth error: ${error.message}`);
    if (!user) throw new Error('No authenticated user');

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, profile_picture')
      .eq('id', user.id)
      .single();

    console.log('Profile data:', data, 'Profile error:', profileError);
    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      formAction.value.formErrorMessage = `Failed to fetch profile: ${profileError.message}`;
      showErrorAlert.value = true;
      userProfile.value.fullName = 'Profile Unavailable';
      userProfile.value.initials = getAvatarText('Profile Unavailable');
      return;
    }
    if (!data) {
      console.error('No profile data found for user ID:', user.id);
      formAction.value.formErrorMessage = 'No profile found. Please create a profile.';
      showErrorAlert.value = true;
      userProfile.value.fullName = 'Profile Unavailable';
      userProfile.value.initials = getAvatarText('Profile Unavailable');
      return;
    }
    if (!data.full_name) {
      console.error('full_name is missing or NULL for user ID:', user.id);
      formAction.value.formErrorMessage = 'Profile missing full_name. Please update your profile.';
      showErrorAlert.value = true;
      userProfile.value.fullName = 'Profile Unavailable';
      userProfile.value.initials = getAvatarText('Profile Unavailable');
      return;
    }

    userProfile.value.fullName = data.full_name;
    userProfile.value.role = data.role || 'User';
    userProfile.value.initials = getAvatarText(data.full_name);
    userProfile.value.profilePicture = data.profile_picture || '/default-avatar.png';
    console.log('UserProfile fetched:', userProfile.value);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    formAction.value.formErrorMessage = `Failed to load profile: ${error.message}`;
    showErrorAlert.value = true;
    userProfile.value.fullName = 'Profile Unavailable';
    userProfile.value.initials = getAvatarText('Profile Unavailable');
  }
};

const fetchDashboardData = async () => {
  // Your existing code remains unchanged...
};

const uploadVRScene = async (file) => {
  // Your existing code remains unchanged...
};

const logout = async () => {
  // Your existing code remains unchanged...
};

const handleImageError = () => {
  // Your existing code remains unchanged...
};

onMounted(async () => {
  console.log('onMounted triggered');
  try {
    const authenticated = await Promise.race([
      isAuthenticated(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Authentication timeout')), 5000)),
    ]);
    console.log('Authenticated:', authenticated);
    if (!authenticated) {
      console.warn('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    await fetchUserProfile();
    await fetchDashboardData();
    await fetchWeather(); // NEW: Load weather
  } catch (error) {
    console.error('Error in onMounted:', error.message);
    formAction.value.formErrorMessage = 'Failed to initialize dashboard: ' + error.message;
    showErrorAlert.value = true;
  } finally {
    console.log('Setting loading to false');
    loading.value = false;
  }
});
</script>

<template>
  <!-- Alert Notification -->
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
    :show-success-alert="showSuccessAlert"
    :show-error-alert="showErrorAlert"
    @update:successAlert="showSuccessAlert = $event"
    @update:errorAlert="showErrorAlert = $event"
  />

  <v-app>
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

    <!-- Navbar -->
    <v-app-bar flat color="primary">
      <v-container class="d-flex align-center pa-0">
        <v-btn icon @click="drawer = !drawer" color="white">
          <v-icon>mdi-menu</v-icon>
        </v-btn>

        <div class="d-flex align-center ml-4">
          <RouterLink
            v-for="link in links"
            :key="link.title"
            :to="link.path"
            class="nav-link d-none d-sm-inline"
            :aria-label="`Navigate to ${link.title}`"
          >
            {{ link.title }}
          </RouterLink>
        </div>

        <v-spacer />

        <ProfileHeader
          :full-name="userProfile.fullName"
          :role="userProfile.role"
          :initials="userProfile.initials"
          :profile-picture="userProfile.profilePicture"
          :logout="logout"
        />
      </v-container>
    </v-app-bar>

    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" temporary color="secondary">
      <v-list>
        <v-list-item
          v-for="(item, index) in sidebarItems"
          :key="index"
          :to="item.path !== '/logout' ? item.path : undefined"
          class="py-3 text-white"
          link
          @click="item.path === '/logout' && logout()"
        >
          <template v-slot:prepend>
            <v-icon color="white">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="dashboard-container">
      <v-container>
        <v-row>
          <!-- Profile Widget -->
          <v-col cols="12" md="4">
            <v-card class="profile-card pa-4" elevation="6">
              <v-avatar size="80" class="mx-auto mb-3 profile-avatar">
                <img
                  v-if="userProfile.profilePicture"
                  :src="userProfile.profilePicture"
                  alt="Profile Picture"
                  class="profile-image"
                  @error="handleImageError"
                />
                <span v-else class="text-h5 white--text">{{ userProfile.initials }}</span>
              </v-avatar>
              <v-card-title class="text-center">{{ userProfile.fullName }}</v-card-title>
              <v-card-subtitle class="text-center">{{ userProfile.role }}</v-card-subtitle>
            </v-card>
          </v-col>

          <!-- Quick Actions -->
          <v-col cols="12" md="4">
            <v-card class="pa-4" elevation="6">
              <v-card-title>Quick Actions</v-card-title>
              <v-btn block color="primary" class="mb-2">View AR Sessions</v-btn>
              <v-btn block color="secondary">Manage Hotspots</v-btn>
            </v-card>
          </v-col>

          <!-- Notifications -->
          <v-col cols="12" md="4">
            <v-card class="pa-4" elevation="6">
              <v-card-title>Notifications</v-card-title>
              <v-list density="compact">
                <v-list-item v-if="notifications.length === 0">
                  <v-list-item-title>No notifications available</v-list-item-title>
                </v-list-item>
                <v-list-item v-else v-for="(notification, index) in notifications" :key="index">
                  <v-icon :color="notification.color">{{ notification.icon }}</v-icon>
                  {{ notification.text }}
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>

        <!-- AR Navigation Metrics + Weather -->
        <v-row>
          <v-col cols="12" md="3">
            <v-card color="light-blue lighten-4" class="pa-3" flat elevation="6">
              <v-card-title>Live AR Users</v-card-title>
              <v-card-subtitle>{{ metrics.liveUsers }} Active</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="teal lighten-4" class="pa-3" flat elevation="6">
              <v-card-title>3D Map Interactions</v-card-title>
              <v-card-subtitle>{{ metrics.mapInteractions }} Today</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="amber lighten-4" class="pa-3" flat elevation="6">
              <v-card-title>Visited Hotspots</v-card-title>
              <v-card-subtitle>{{ metrics.visitedHotspots }} Total</v-card-subtitle>
            </v-card>
          </v-col>

          <!-- NEW: Weather Card -->
          <v-col cols="12" md="3">
            <v-card color="blue lighten-5" class="pa-3" flat elevation="6">
              <v-card-title>Weather (Cagayan de Oro)</v-card-title>
              <v-card-text v-if="weatherLoading">
                <v-progress-circular indeterminate color="primary" size="24" />
              </v-card-text>
              <v-card-text v-else-if="weatherError">
                {{ weatherError }}
              </v-card-text>
              <v-card-text v-else class="d-flex align-center">
                <v-icon size="48" :color="getWeatherColor(weather.description)">
                  {{ weather.icon }}
                </v-icon>
                <div class="ml-4">
                  <div class="text-h5">{{ weather.temp }}°C</div>
                  <div class="text-subtitle-1 text-capitalize">{{ weather.description }}</div>
                  <div class="text-caption">
                    Humidity: {{ weather.humidity }}% | Wind: {{ weather.windSpeed }} m/s
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent Activities -->
        <v-row>
          <v-col cols="12">
            <v-card class="pa-4" elevation="6">
              <v-card-title>Recent Activities</v-card-title>
              <v-list>
                <v-list-item v-if="recentActivities.length === 0">
                  <v-list-item-title>No recent activities</v-list-item-title>
                </v-list-item>
                <v-list-item v-else v-for="(activity, index) in recentActivities" :key="index">
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
            <v-card class="pa-4" elevation="6">
              <v-card-title>Deploy VR Experience</v-card-title>
              <v-card-text>
                <v-file-input
                  v-model="vrFile"
                  label="Upload VR Scene"
                  accept=".glb,.gltf,.fbx"
                  prepend-icon="mdi-vr"
                  class="mb-3"
                ></v-file-input>
                <v-btn color="primary" block @click="uploadVRScene(vrFile)">Deploy to Supabase</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #F5F6F5 0%, #E8F5E9 100%);
  overflow: auto;
}

.nav-link {
  margin: 0 8px;
  text-decoration: none !important;
  color: white;
  font-weight: 500;
}
.nav-link:hover,
.nav-link:focus,
.nav-link:active {
  text-decoration: none !important;
  color: var(--v-theme-accent);
}

.profile-card {
  text-align: center;
  background: white;
  border-radius: 12px;
  transition: transform 0.3s ease-in-out;
}
.profile-card:hover {
  transform: scale(1.02);
}

.profile-avatar {
  transition: transform 0.3s ease-in-out;
  overflow: hidden;
}
.profile-avatar:hover {
  transform: scale(1.1);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
}

.v-app-bar {
  z-index: 1000 !important;
}

.v-container {
  max-width: 1200px;
  padding: 16px;
}

.v-list-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.v-card {
  border-radius: 12px;
}

/* NEW: Weather card hover effect */
.weather-card {
  transition: transform 0.2s;
}
.weather-card:hover {
  transform: scale(1.02);
}
</style>
