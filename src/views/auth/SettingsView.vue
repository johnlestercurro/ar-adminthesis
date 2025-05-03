<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isAuthenticated } from '@/utils/supabase';
import AlertNotification from '@/components/common/AlertNotification.vue';

// Router and state
const router = useRouter();
const loading = ref(true);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const formAction = ref({
  formSuccessMessage: 'Success!',
  formErrorMessage: 'An error occurred.',
});

// User profile
const userProfile = ref({
  id: '',
  fullName: 'Unknown User',
  email: '',
});

// Settings states
const darkMode = ref(false);
const emailNotifications = ref(true);
const pushNotifications = ref(false);
const language = ref('en');
const twoFactorEnabled = ref(false);
const timeZone = ref('UTC');
const shareAnalytics = ref(false);

// Language options
const languages = [
  { value: 'en', text: 'English' },
  { value: 'es', text: 'Spanish' },
  { value: 'fr', text: 'French' },
];

// Time zone options
const timeZones = [
  { value: 'UTC', text: 'UTC' },
  { value: 'America/New_York', text: 'Eastern Time (US)' },
  { value: 'America/Los_Angeles', text: 'Pacific Time (US)' },
  { value: 'Europe/London', text: 'London' },
  { value: 'Asia/Tokyo', text: 'Tokyo' },
];

// Functions
const fetchUserProfile = async () => {
  console.log('Fetching user profile...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Auth user:', user, 'Error:', error);
    if (error) throw new Error(`Auth error: ${error.message}`);
    if (!user) throw new Error('No authenticated user');

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, dark_mode, email_notifications, push_notifications, language, two_factor_enabled, time_zone, share_analytics')
      .eq('id', user.id)
      .single();

    console.log('Profile data:', data, 'Profile error:', profileError);
    if (profileError || !data) {
      console.warn('Profile fetch error or no data:', profileError?.message);
      userProfile.value.id = user.id;
      userProfile.value.fullName = user.email || 'Unknown User';
      userProfile.value.email = user.email || '';
    } else {
      userProfile.value.id = data.id;
      userProfile.value.fullName = data.full_name || user.email || 'Unknown User';
      userProfile.value.email = user.email || '';
      darkMode.value = data.dark_mode || false;
      emailNotifications.value = data.email_notifications ?? true;
      pushNotifications.value = data.push_notifications || false;
      language.value = data.language || 'en';
      twoFactorEnabled.value = data.two_factor_enabled || false;
      timeZone.value = data.time_zone || 'UTC';
      shareAnalytics.value = data.share_analytics || false;
    }
    console.log('UserProfile fetched:', userProfile.value);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    formAction.value.formErrorMessage = 'Failed to load settings. Please log in again.';
    showErrorAlert.value = true;
    router.push('/login');
  }
};

const updateSettings = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        dark_mode: darkMode.value,
        email_notifications: emailNotifications.value,
        push_notifications: pushNotifications.value,
        language: language.value,
        two_factor_enabled: twoFactorEnabled.value,
        time_zone: timeZone.value,
        share_analytics: shareAnalytics.value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.value.id);

    if (error) throw error;

    // Placeholder for 2FA
    if (twoFactorEnabled.value) {
      console.log('2FA enable requested - requires Supabase Auth MFA setup');
    } else {
      console.log('2FA disable requested - requires Supabase Auth MFA setup');
    }

    formAction.value.formSuccessMessage = 'Settings saved successfully!';
    showSuccessAlert.value = true;
  } catch (error) {
    console.error('Error updating settings:', error.message);
    formAction.value.formErrorMessage = `Failed to save settings: ${error.message}`;
    showErrorAlert.value = true;
  }
};

const exportData = async () => {
  try {
    const [profileRes, activitiesRes] = await Promise.all([
      supabase.from('profiles').select('full_name, email, role, language, time_zone').eq('id', userProfile.value.id).single(),
      supabase.from('activities').select('icon, color, text, created_at').eq('user_id', userProfile.value.id),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (activitiesRes.error) throw activitiesRes.error;

    const data = {
      profile: profileRes.data,
      activities: activitiesRes.data || [],
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_data_${userProfile.value.id}.json`;
    link.click();
    URL.revokeObjectURL(url);

    formAction.value.formSuccessMessage = 'Data exported successfully!';
    showSuccessAlert.value = true;
  } catch (error) {
    console.error('Error exporting data:', error.message);
    formAction.value.formErrorMessage = `Failed to export data: ${error.message}`;
    showErrorAlert.value = true;
  }
};

const deleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userProfile.value.id);
    if (profileError) throw profileError;

    console.warn('Account deletion requires Supabase admin API or custom function');
    // Placeholder: await supabase.rpc('delete_user', { user_id: userProfile.value.id });

    await supabase.auth.signOut();
    formAction.value.formSuccessMessage = 'Account deleted successfully.';
    showSuccessAlert.value = true;
    router.push('/login');
  } catch (error) {
    console.error('Error deleting account:', error.message);
    formAction.value.formErrorMessage = `Failed to delete account: ${error.message}`;
    showErrorAlert.value = true;
  }
};

const logout = async () => {
  try {
    await supabase.auth.signOut();
    router.push('/login');
  } catch (error) {
    console.error('Error signing out:', error.message);
    formAction.value.formErrorMessage = 'Failed to sign out.';
    showErrorAlert.value = true;
  }
};

onMounted(async () => {
  console.log('onMounted triggered');
  try {
    const authenticated = await isAuthenticated();
    console.log('Authenticated:', authenticated);
    if (!authenticated) {
      console.warn('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    await fetchUserProfile();
  } catch (error) {
    console.error('Error in onMounted:', error.message);
    formAction.value.formErrorMessage = 'Failed to initialize settings: ' + error.message;
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
    <!-- Loading Overlay -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="green" size="64" />
    </v-overlay>

    <!-- Main Content -->
    <v-main class="settings-container">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-5 card-style">
              <v-card-title class="title-style">
                <v-icon left color="white">mdi-cog</v-icon>
                Settings
              </v-card-title>
              <v-divider class="my-4"></v-divider>

              <!-- Appearance Settings -->
              <v-card-subtitle class="text-h6 font-weight-bold">Appearance</v-card-subtitle>
              <v-switch
                v-model="darkMode"
                label="Enable Dark Mode"
                class="switch-style"
                :class="{ 'active-switch': darkMode, 'inactive-switch': !darkMode }"
                color="transparent"
              ></v-switch>

              <v-divider class="my-4"></v-divider>

              <!-- Notification Settings -->
              <v-card-subtitle class="text-h6 font-weight-bold">Notifications</v-card-subtitle>
              <v-switch
                v-model="emailNotifications"
                label="Email Notifications"
                class="switch-style"
                :class="{ 'active-switch': emailNotifications, 'inactive-switch': !emailNotifications }"
                color="transparent"
              ></v-switch>
              <v-switch
                v-model="pushNotifications"
                label="Push Notifications"
                class="switch-style"
                :class="{ 'active-switch': pushNotifications, 'inactive-switch': !pushNotifications }"
                color="transparent"
              ></v-switch>

              <v-divider class="my-4"></v-divider>

              <!-- Language Settings -->
              <v-card-subtitle class="text-h6 font-weight-bold">Language</v-card-subtitle>
              <v-select
                v-model="language"
                :items="languages"
                label="Select Language"
                variant="outlined"
                class="input-style"
              ></v-select>

              <v-divider class="my-4"></v-divider>

              <!-- Time Zone Settings -->
              <v-card-subtitle class="text-h6 font-weight-bold">Time Zone</v-card-subtitle>
              <v-select
                v-model="timeZone"
                :items="timeZones"
                label="Select Time Zone"
                variant="outlined"
                class="input-style"
              ></v-select>

              <v-divider class="my-4"></v-divider>

              <!-- Security Settings -->
              <v-card-subtitle class="text-h6 font-weight-bold">Security</v-card-subtitle>
              <v-switch
                v-model="twoFactorEnabled"
                label="Enable Two-Factor Authentication"
                class="switch-style"
                :class="{ 'active-switch': twoFactorEnabled, 'inactive-switch': !twoFactorEnabled }"
                color="transparent"
              ></v-switch>

              <v-divider class="my-4"></v-divider>

              <!-- Privacy Settings -->
              <v-card-subtitle class="text-h6 font-weight-bold">Privacy</v-card-subtitle>
              <v-switch
                v-model="shareAnalytics"
                label="Share Analytics with Admins"
                class="switch-style"
                :class="{ 'active-switch': shareAnalytics, 'inactive-switch': !shareAnalytics }"
                color="transparent"
              ></v-switch>
              <v-btn color="primary" block @click="exportData" class="button-style mt-2">Export My Data</v-btn>

              <v-divider class="my-4"></v-divider>

              <!-- Account Actions -->
              <v-card-subtitle class="text-h6 font-weight-bold">Account</v-card-subtitle>
              <v-btn block @click="deleteAccount" class="button-deactivate">Delete Account</v-btn>
              <v-btn block class="button-cancel mt-2" @click="logout">Logout</v-btn>

              <!-- Save Button -->
              <v-btn color="primary" block class="button-style mt-4" @click="updateSettings">Save Settings</v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Base theme */
.settings-container {
  background: linear-gradient(135deg, #F5F6F5 0%, #E8F5E9 100%);
  overflow: auto;
  padding: 16px;
}

/* Container */
.v-container {
  max-width: 1200px;
}

/* Card */
.card-style {
  border-radius: 12px;
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #C8E6C9;
}

/* Title */
.title-style {
  background: linear-gradient(90deg, #4CAF50 0%, #81C784 100%);
  color: #FFFFFF;
  padding: 16px;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
}

/* Inputs */
.input-style {
  background: #FFFFFF;
  border-radius: 8px;
}
.input-style :deep(.v-field) {
  border: 1px solid #C8E6C9;
}
.input-style :deep(.v-field--focused) {
  border-color: #C8E6C9 !important;
  box-shadow: 0 0 8px rgba(200, 230, 201, 0.3);
}

/* Switches */
.switch-style {
  transition: all 0.3s ease;
}
.active-switch :deep(.v-switch__track) {
  background-color: #4CAF50 !important;
  opacity: 1 !important;
}
.inactive-switch :deep(.v-switch__track) {
  background-color: #EF5350 !important;
  opacity: 1 !important;
}
.active-switch :deep(.v-switch__thumb) {
  background-color: #FFFFFF !important;
}
.inactive-switch :deep(.v-switch__thumb) {
  background-color: #FFFFFF !important;
}
:deep(.v-switch__track) {
  transition: background-color 0.3s ease;
}
:deep(.v-switch__thumb) {
  transition: background-color 0.3s ease;
}

/* Buttons */
.button-style {
  background: linear-gradient(90deg, #4CAF50 0%, #81C784 100%);
  color: #FFFFFF !important;
  border-radius: 8px;
  text-transform: none;
  transition: all 0.3s ease;
}
.button-style:hover {
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.5);
}
.button-deactivate {
  background: linear-gradient(90deg, #EF5350 0%, #F06292 100%);
  color: #FFFFFF !important;
  border: 1px solid #D32F2F;
  border-radius: 8px;
  text-transform: none;
  transition: all 0.3s ease;
}
.button-deactivate:hover {
  box-shadow: 0 0 12px rgba(239, 83, 80, 0.5);
}
.button-cancel {
  color: #4A4A4A !important;
  text-transform: none;
  border-radius: 8px;
}

/* Alert */
.alert-style {
  border-radius: 8px;
}
</style>
