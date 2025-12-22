<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isAuthenticated } from '@/utils/supabase';
import AlertNotification from '@/components/common/AlertNotification.vue';

const router = useRouter();
const loading = ref(true);
const showSuccessAlert = ref(false);
const showErrorAlert = ref(false);
const formAction = ref({
  formSuccessMessage: 'Success!',
  formErrorMessage: 'An error occurred.',
});

const user = ref({
  id: '',
  fullName: 'Unknown User',
  email: '',
  phone: '',
  role: 'Admin',
  profilePicture: '/default-avatar.png',
  notifications: true,
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const recentActivities = ref([]);
const isEditing = ref(false);
const editedUser = ref({ ...user.value });

// Fetch user profile from Supabase
const fetchUserProfile = async () => {
  console.log('Fetching user profile...');
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    console.log('Auth user:', { id: authUser?.id, email: authUser?.email }, 'Error:', authError);
    if (authError) throw new Error(`Auth error: ${authError.message}`);
    if (!authUser) throw new Error('No authenticated user');

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone, role, profile_picture')
      .eq('id', authUser.id)
      .single();

    console.log('Profile data:', data, 'Profile error:', profileError);
    if (profileError || !data) {
      console.warn('Profile fetch error or no data:', profileError?.message);
      user.value.fullName = authUser.email || 'Unknown User';
      user.value.email = authUser.email || '';
      user.value.role = 'Admin';
      user.value.profilePicture = '/default-avatar.png';
    } else {
      user.value.id = authUser.id;
      user.value.fullName = data.full_name || authUser.email;
      user.value.email = data.email || authUser.email;
      user.value.phone = data.phone || '';
      user.value.role = data.role || 'Admin';
      user.value.profilePicture = data.profile_picture || '/default-avatar.png';
    }
    editedUser.value = { ...user.value };
    console.log('UserProfile fetched:', user.value);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    formAction.value.formErrorMessage = 'Failed to load profile. Please log in again.';
    showErrorAlert.value = true;
    router.push('/login');
  }
};

// Fetch recent activities
const fetchRecentActivities = async () => {
  console.log('Fetching recent activities...');
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('icon, color, text')
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('Activities response:', data, 'Error:', error);
    if (error || !data || data.length === 0) {
      console.warn('No activities found:', error?.message);
      recentActivities.value = [
        { icon: 'mdi-login', color: 'blue', text: 'Logged in from IP: 192.168.1.100' },
        { icon: 'mdi-check-circle', color: 'green', text: 'Updated profile picture' },
        { icon: 'mdi-lock-reset', color: 'red', text: 'Changed password' },
      ];
    } else {
      recentActivities.value = data;
    }
  } catch (error) {
    console.error('Error fetching activities:', error.message);
    recentActivities.value = [
      { icon: 'mdi-information', color: 'grey', text: 'No recent activities.' },
    ];
  }
};

// Handle profile picture upload and save to profiles
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    formAction.value.formErrorMessage = 'Please upload a JPEG or PNG image.';
    showErrorAlert.value = true;
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    formAction.value.formErrorMessage = 'Image size exceeds 2MB limit.';
    showErrorAlert.value = true;
    return;
  }

  try {
    const fileName = `${user.value.id}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) throw new Error('Failed to get public URL');
    console.log('Uploaded profile picture URL:', urlData.publicUrl);

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        profile_picture: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.value.id);

    if (profileError) throw profileError;

    // Update UI
    user.value.profilePicture = urlData.publicUrl;
    editedUser.value.profilePicture = urlData.publicUrl;
    console.log('UI updated with profile picture:', user.value.profilePicture);

    formAction.value.formSuccessMessage = 'Profile picture uploaded successfully!';
    showSuccessAlert.value = true;
  } catch (error) {
    console.error('Error uploading profile picture:', error.message);
    formAction.value.formErrorMessage = `Failed to upload profile picture: ${error.message}`;
    showErrorAlert.value = true;
    user.value.profilePicture = '/default-avatar.png';
  }
};

// Save profile updates
const saveProfile = async () => {
  if (!editedUser.value.fullName || !editedUser.value.email) {
    formAction.value.formErrorMessage = 'Name and email are required.';
    showErrorAlert.value = true;
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.value.email)) {
    formAction.value.formErrorMessage = 'Invalid email format.';
    showErrorAlert.value = true;
    return;
  }

  try {
    // Update auth.users email if changed
    if (editedUser.value.email !== user.value.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: editedUser.value.email,
      });
      if (authError) throw new Error(`Auth update error: ${authError.message}`);
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: editedUser.value.fullName,
        email: editedUser.value.email,
        phone: editedUser.value.phone,
        profile_picture: editedUser.value.profilePicture,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.value.id);

    if (profileError) throw profileError;

    user.value = { ...editedUser.value };
    isEditing.value = false;
    formAction.value.formSuccessMessage = 'Profile updated successfully!';
    showSuccessAlert.value = true;
  } catch (error) {
    console.error('Error updating profile:', error.message);
    formAction.value.formErrorMessage = `Failed to update profile: ${error.message}`;
    showErrorAlert.value = true;
  }
};

// Change password
const changePassword = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    formAction.value.formErrorMessage = 'All password fields are required.';
    showErrorAlert.value = true;
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    formAction.value.formErrorMessage = 'New passwords do not match.';
    showErrorAlert.value = true;
    return;
  }
  if (passwordForm.value.newPassword.length < 6) {
    formAction.value.formErrorMessage = 'New password must be at least 6 characters.';
    showErrorAlert.value = true;
    return;
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword,
    });
    if (error) throw error;

    passwordForm.value.currentPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.confirmPassword = '';
    formAction.value.formSuccessMessage = 'Password changed successfully!';
    showSuccessAlert.value = true;
  } catch (error) {
    console.error('Error changing password:', error.message);
    formAction.value.formErrorMessage = `Failed to change password: ${error.message}`;
    showErrorAlert.value = true;
  }
};

// NEW: Log Out function
const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error.message);
    formAction.value.formErrorMessage = 'Failed to log out.';
    showErrorAlert.value = true;
  }
};

// Handle image load error
const handleImageError = () => {
  console.warn('Profile picture failed to load, using default avatar');
  user.value.profilePicture = '/default-avatar.png';
  editedUser.value.profilePicture = '/default-avatar.png';
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
    await fetchRecentActivities();
  } catch (error) {
    console.error('Error in onMounted:', error.message);
    formAction.value.formErrorMessage = 'Failed to initialize profile: ' + error.message;
    showErrorAlert.value = true;
  } finally {
    console.log('Setting loading to false');
    loading.value = false;
  }
});
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
    :show-success-alert="showSuccessAlert"
    :show-error-alert="showErrorAlert"
    @update:successAlert="showSuccessAlert = $event"
    @update:errorAlert="showErrorAlert = $event"
  />

  <v-container class="profile-container">
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

    <v-row>
      <!-- Profile Details -->
      <v-col cols="12" md="4">
        <v-card class="pa-4 profile-card" elevation="6">
          <v-card-title class="text-center">Profile</v-card-title>
          <v-divider></v-divider>

          <!-- Profile Picture -->
          <div class="d-flex flex-column align-center mt-3">
            <v-avatar size="120" class="profile-avatar">
              <img :src="user.profilePicture" alt="Profile Picture" class="profile-image" @error="handleImageError" />
            </v-avatar>
            <v-btn class="mt-2 upload-btn" color="primary" variant="tonal">
              Upload New
              <input type="file" accept="image/jpeg,image/png" @change="handleFileUpload" class="file-input" />
            </v-btn>
          </div>

          <!-- Profile Info -->
          <v-card-text class="text-center mt-3">
            <h3>{{ user.fullName }}</h3>
            <p class="text-caption">{{ user.role }}</p>
            <p class="text-caption">{{ user.email }}</p>
            <p class="text-caption">{{ user.phone || 'No phone number' }}</p>
          </v-card-text>

          <!-- NEW: Log Out Button (placed at the bottom of the profile card) -->
          <v-btn
            color="error"
            variant="tonal"
            block
            class="mt-6"
            @click="logout"
          >
            Log Out
          </v-btn>
        </v-card>
      </v-col>

      <!-- Account Settings -->
      <v-col cols="12" md="8">
        <v-card class="pa-4 fade-in" elevation="6">
          <v-card-title>Account Settings</v-card-title>
          <v-divider></v-divider>

          <!-- Edit Profile Form -->
          <v-form v-if="isEditing" @submit.prevent="saveProfile">
            <v-text-field
              v-model="editedUser.fullName"
              label="Full Name"
              variant="outlined"
              class="mt-3"
              required
            ></v-text-field>
            <v-text-field
              v-model="editedUser.email"
              label="Email"
              type="email"
              variant="outlined"
              required
            ></v-text-field>
            <v-text-field
              v-model="editedUser.phone"
              label="Phone Number"
              type="tel"
              variant="outlined"
            ></v-text-field>
            <v-switch
              v-model="editedUser.notifications"
              label="Receive Email Notifications"
              inset
            ></v-switch>
            <div class="d-flex">
              <v-btn color="primary" type="submit" class="mr-2">Save</v-btn>
              <v-btn color="secondary" @click="isEditing = false">Cancel</v-btn>
            </div>
          </v-form>

          <!-- Display Profile Info -->
          <div v-else class="mt-3">
            <v-card-text>
              <p><strong>Name:</strong> {{ user.fullName }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>Phone:</strong> {{ user.phone || 'Not set' }}</p>
              <p><strong>Notifications:</strong> {{ user.notifications ? 'Enabled' : 'Disabled' }}</p>
            </v-card-text>
            <v-btn color="primary" @click="isEditing = true">Edit Profile</v-btn>
          </div>

          <!-- Change Password -->
          <div class="mt-5">
            <v-card-subtitle>Change Password</v-card-subtitle>
            <v-form @submit.prevent="changePassword">
              <v-text-field
                v-model="passwordForm.currentPassword"
                label="Current Password"
                type="password"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-model="passwordForm.newPassword"
                label="New Password"
                type="password"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-model="passwordForm.confirmPassword"
                label="Confirm New Password"
                type="password"
                variant="outlined"
              ></v-text-field>
              <v-btn color="primary" type="submit">Change Password</v-btn>
            </v-form>
          </div>
        </v-card>

        <!-- Recent Activity -->
        <v-card class="pa-4 mt-4 fade-in" elevation="6">
          <v-card-title>Recent Activity</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item v-for="(activity, index) in recentActivities" :key="index">
              <template v-slot:prepend>
                <v-icon :color="activity.color">{{ activity.icon }}</v-icon>
              </template>
              {{ activity.text }}
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.profile-container {
  background: linear-gradient(135deg, #F5F6F5 0%, #E8F5E9 100%);
  min-height: 100vh;
  padding: 20px;
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
