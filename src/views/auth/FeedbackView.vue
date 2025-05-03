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
  role: 'User',
});

// Feedback state
const comment = ref('');
const reaction = ref('');
const feedbackItems = ref([]);
const headers = [
  { title: 'Comment', key: 'comment', sortable: true },
  { title: 'Reaction', key: 'reaction', sortable: true },
  { title: 'Date', key: 'created_at', sortable: true },
];

// Reaction options
const reactions = [
  { value: '😊', text: 'Happy' },
  { value: '👍', text: 'Thumbs Up' },
  { value: '👎', text: 'Thumbs Down' },
  { value: '😞', text: 'Sad' },
];

// Fetch user profile and role
const fetchUserProfile = async () => {
  console.log('Fetching user profile...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Auth user:', user, 'Error:', error);
    if (error) throw new Error(`Auth error: ${error.message}`);
    if (!user) throw new Error('No authenticated user');

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', user.id)
      .single();

    console.log('Profile data:', data, 'Profile error:', profileError);
    if (profileError || !data) {
      console.warn('Profile fetch error or no data:', profileError?.message);
      userProfile.value.id = user.id;
      userProfile.value.fullName = user.email || 'Unknown User';
      userProfile.value.email = user.email || '';
      userProfile.value.role = 'User';
    } else {
      userProfile.value.id = data.id;
      userProfile.value.fullName = data.full_name || user.email || 'Unknown User';
      userProfile.value.email = user.email || '';
      userProfile.value.role = data.role || 'User';
    }
    console.log('UserProfile fetched:', userProfile.value);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    formAction.value.formErrorMessage = 'Failed to load feedback page. Please log in again.';
    showErrorAlert.value = true;
    router.push('/login');
  }
};

// Fetch feedback
const fetchFeedback = async () => {
  console.log('Fetching feedback...');
  try {
    let query = supabase.from('feedback').select('id, comment, reaction, created_at');
    if (userProfile.value.role !== 'Admin') {
      query = query.eq('user_id', userProfile.value.id);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    console.log('Feedback fetch response:', { data, error });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    feedbackItems.value = data || [];
    console.log('Fetched feedback count:', feedbackItems.value.length);
  } catch (error) {
    console.error('Error fetching feedback:', error.message);
    formAction.value.formErrorMessage = `Failed to load feedback: ${error.message}`;
    showErrorAlert.value = true;
  }
};

// Submit feedback
const submitFeedback = async () => {
  if (!comment.value.trim()) {
    formAction.value.formErrorMessage = 'Comment cannot be empty.';
    showErrorAlert.value = true;
    return;
  }
  console.log('Submitting feedback:', { comment: comment.value, reaction: reaction.value });
  try {
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: userProfile.value.id,
        comment: comment.value.trim(),
        reaction: reaction.value || null,
        created_at: new Date().toISOString(),
      });
    console.log('Insert response:', { error });
    if (error) throw new Error(`Supabase insert error: ${error.message}`);
    formAction.value.formSuccessMessage = 'Feedback submitted successfully!';
    showSuccessAlert.value = true;
    comment.value = '';
    reaction.value = '';
    await fetchFeedback();
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    formAction.value.formErrorMessage = `Failed to submit feedback: ${error.message}`;
    showErrorAlert.value = true;
  }
};

onMounted(async () => {
  console.log('FeedbackView.vue mounted');
  try {
    const authenticated = await isAuthenticated();
    console.log('Authenticated:', authenticated);
    if (!authenticated) {
      console.warn('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    await fetchUserProfile();
    await fetchFeedback();
  } catch (error) {
    console.error('Error in onMounted:', error.message);
    formAction.value.formErrorMessage = 'Failed to initialize feedback page: ' + error.message;
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
    <v-main class="feedback-container">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" lg="6">
            <v-card class="pa-5 card-style">
              <v-card-title class="title-style">
                <v-icon left color="white">mdi-comment-text</v-icon>
                Feedback
              </v-card-title>
              <v-divider class="my-4"></v-divider>

              <!-- Feedback Form -->
              <v-card-subtitle class="text-h6 font-weight-bold">Share Your Feedback</v-card-subtitle>
              <v-textarea
                v-model="comment"
                label="Comments or Suggestions"
                variant="outlined"
                rows="4"
                class="input-style mb-4"
              ></v-textarea>
              <v-select
                v-model="reaction"
                :items="reactions"
                label="Reaction (Optional)"
                variant="outlined"
                clearable
                class="input-style mb-4"
              ></v-select>
              <v-btn block class="button-style" @click="submitFeedback">Submit Feedback</v-btn>

              <v-divider class="my-4"></v-divider>

              <!-- Feedback List -->
              <v-card-subtitle class="text-h6 font-weight-bold">
                {{ userProfile.role === 'Admin' ? 'All Feedback' : 'Your Feedback' }}
              </v-card-subtitle>
              <v-data-table
                :items="feedbackItems"
                :headers="headers"
                :loading="loading"
                class="table-style"
                :no-data-text="userProfile.role === 'Admin' ? 'No feedback submitted yet.' : 'You haven’t submitted any feedback yet.'"
              >
                <template v-slot:item.reaction="{ item }">
                  {{ item.reaction || 'None' }}
                </template>
                <template v-slot:item.created_at="{ item }">
                  {{ new Date(item.created_at).toLocaleString() }}
                </template>
              </v-data-table>

              <v-divider class="my-4"></v-divider>

              <!-- Back to Dashboard -->
              <v-btn to="/" block class="button-cancel">Back to Dashboard</v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Base theme */
.feedback-container {
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

/* Table */
.table-style {
  background: #FAF7F0;
  border-radius: 8px;
  border: 1px solid #C8E6C9;
}
.table-style :deep(.v-data-table-header) {
  background: #E8F5E9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.table-style :deep(.v-data-table__th) {
  color: #4A4A4A !important;
  font-weight: 600 !important;
}
.table-style :deep(.v-data-table__tr:nth-child(even)) {
  background: #FFFFFF;
}
.table-style :deep(.v-data-table__tr:hover) {
  background: #E8F5E9 !important;
}
.table-style :deep(.v-data-table-footer) {
  background: #E8F5E9;
  border-top: 1px solid #C8E6C9;
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
