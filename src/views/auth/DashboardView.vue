<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase, isAuthenticated } from '@/utils/supabase';
import AlertNotification from '@/components/common/AlertNotification.vue';
import ProfileHeader from '@/components/common/layout/ProfileHeader.vue';

const router = useRouter();
const route = useRoute();

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

const fetchUserProfile = async () => {
  console.log('Fetching user profile...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(`Auth error: ${error.message}`);
    if (!user) throw new Error('No authenticated user');

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, profile_picture')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!data) throw new Error('No profile found');

    userProfile.value.fullName = data.full_name || 'Unknown User';
    userProfile.value.role = data.role || 'User';
    userProfile.value.initials = getAvatarText(data.full_name);
    userProfile.value.profilePicture = data.profile_picture || '/default-avatar.png';
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    formAction.value.formErrorMessage = `Failed to load profile: ${error.message}`;
    showErrorAlert.value = true;
    userProfile.value.fullName = 'Profile Unavailable';
    userProfile.value.initials = getAvatarText('Profile Unavailable');
  }
};

const fetchDashboardData = async () => {
  console.log('Fetching dashboard data...');
  try {
    // Metrics
    const { data: metricsData } = await supabase
      .from('metrics')
      .select('live_users, map_interactions, visited_hotspots')
      .limit(1);
    if (metricsData?.length) {
      metrics.value = {
        liveUsers: metricsData[0].live_users || 0,
        mapInteractions: metricsData[0].map_interactions || 0,
        visitedHotspots: metricsData[0].visited_hotspots || 0,
      };
    }

    // Activities
    const { data: activitiesData } = await supabase
      .from('activities')
      .select('icon, color, text')
      .order('created_at', { ascending: false })
      .limit(2);
    recentActivities.value = activitiesData || [];

    // Notifications
    const { data: notificationsData } = await supabase
      .from('notifications')
      .select('icon, color, text')
      .order('created_at', { ascending: false })
      .limit(2);
    notifications.value = notificationsData || [];
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    formAction.value.formErrorMessage = `Failed to load dashboard data: ${error.message}`;
    showErrorAlert.value = true;
  }
};

const uploadVRScene = async (file) => {
  if (!file) return;
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('vr-scenes').upload(fileName, file);
    if (error) throw error;
    formAction.value.formSuccessMessage = 'VR scene uploaded successfully!';
    showSuccessAlert.value = true;
  } catch (error) {
    formAction.value.formErrorMessage = `Failed to upload: ${error.message}`;
    showErrorAlert.value = true;
  }
};

const logout = async () => {
  try {
    await supabase.auth.signOut();
    router.push('/login');
  } catch (error) {
    formAction.value.formErrorMessage = 'Failed to sign out.';
    showErrorAlert.value = true;
  }
};

const handleImageError = () => {
  userProfile.value.profilePicture = '/default-avatar.png';
};

onMounted(async () => {
  console.log('Dashboard onMounted');

  // Backup: If error somehow slips through, hard redirect to clean dashboard
  if (route.query.error || route.query.error_description) {
    console.warn('Error detected in dashboard mount - forcing clean redirect');
    window.location.href = '/dashboard';
    return;
  }

  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      router.push('/login');
      return;
    }

    await fetchUserProfile();
    await fetchDashboardData();
  } catch (error) {
    console.error('Dashboard initialization error:', error.message);
    formAction.value.formErrorMessage = 'Failed to load dashboard.';
    showErrorAlert.value = true;
  } finally {
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

    <!-- Sidebar -->
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
        <!-- Your existing dashboard content remains unchanged -->
        <v-row>
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

          <!-- Quick Actions, Notifications, Metrics, etc. remain the same -->
          <!-- ... (your existing template code here) ... -->
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

/* ... rest of your styles ... */
</style>
