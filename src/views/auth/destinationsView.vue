<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isAuthenticated } from '@/utils/supabase'; // Main Supabase client

const router = useRouter();
const loading = ref(true);
const destinations = ref([]);
const errorMessage = ref('');
const searchQuery = ref('');
const userRole = ref('User');

// Pagination state
const page = ref(1);
const itemsPerPage = ref(10);
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
];

// Edit dialog state
const editDialog = ref(false);
const editingDestination = ref(null);
const editedName = ref('');
const editError = ref('');

// Reactive status tracking
const destinationStatuses = ref({});

// Initialize statuses from fetched data
const initializeStatuses = (destinations) => {
  destinations.forEach(dest => {
    destinationStatuses.value[dest.id] = dest.status || 'Active';
  });
  console.log('Initialized statuses:', destinationStatuses.value);
};

const toggleStatus = async (destinationId) => {
  if (userRole.value !== 'Admin') {
    errorMessage.value = 'Only admins can update destination statuses';
    return;
  }
  const newStatus = destinationStatuses.value[destinationId] === 'Active' ? 'Inactive' : 'Active';
  destinationStatuses.value[destinationId] = newStatus;
  console.log('Toggled status for ID:', destinationId, 'to', newStatus);

  // Persist to Supabase
  try {
    const { error } = await supabase
      .from('destinations')
      .update({ status: newStatus })
      .eq('id', destinationId);
    if (error) throw new Error(`Failed to update status: ${error.message}`);
    console.log('Status persisted for ID:', destinationId);
  } catch (error) {
    console.error('Error persisting status:', error.message);
    errorMessage.value = `Failed to update status for ID ${destinationId}: ${error.message}`;
    // Revert on failure
    destinationStatuses.value[destinationId] = newStatus === 'Active' ? 'Inactive' : 'Active';
  }
};

const activateAll = async () => {
  if (userRole.value !== 'Admin') {
    errorMessage.value = 'Only admins can update destination statuses';
    return;
  }
  const updates = Object.keys(destinationStatuses.value).map(id => ({
    id,
    status: 'Active',
  }));
  console.log('Activating all destinations:', updates.length);

  try {
    const { error } = await supabase
      .from('destinations')
      .upsert(updates, { onConflict: 'id' });
    if (error) throw new Error(`Failed to activate all: ${error.message}`);
    Object.keys(destinationStatuses.value).forEach(id => {
      destinationStatuses.value[id] = 'Active';
    });
    console.log('Activated all destinations');
  } catch (error) {
    console.error('Error activating all:', error.message);
    errorMessage.value = `Failed to activate all destinations: ${error.message}`;
  }
};

const deactivateAll = async () => {
  if (userRole.value !== 'Admin') {
    errorMessage.value = 'Only admins can update destination statuses';
    return;
  }
  const updates = Object.keys(destinationStatuses.value).map(id => ({
    id,
    status: 'Inactive',
  }));
  console.log('Deactivating all destinations:', updates.length);

  try {
    const { error } = await supabase
      .from('destinations')
      .upsert(updates, { onConflict: 'id' });
    if (error) throw new Error(`Failed to deactivate all: ${error.message}`);
    Object.keys(destinationStatuses.value).forEach(id => {
      destinationStatuses.value[id] = 'Inactive';
    });
    console.log('Deactivated all destinations');
  } catch (error) {
    console.error('Error deactivating all:', error.message);
    errorMessage.value = `Failed to deactivate all destinations: ${error.message}`;
  }
};

const headers = [
  { title: 'Destination', key: 'name', sortable: true },
  { title: 'Edit', key: 'edit', sortable: false },
  { title: 'Availability', key: 'status', sortable: true },
];

const fetchDestinations = async (userId) => {
  console.log('Fetching all destinations from Supabase for user:', userId);
  try {
    loading.value = true;

    // Fetch user role from profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    console.log('Profile fetch response:', { profileData, profileError });
    if (profileError) {
      console.warn('Error fetching profile, defaulting to User role:', profileError.message);
    } else {
      userRole.value = profileData?.role || 'User';
    }
    console.log('User role:', userRole.value);

    // Fetch all destinations (updated query)
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, status')
      .order('name', { ascending: true });
    console.log('Destinations fetch response:', { data, error });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    destinations.value = data || [];
    console.log('Fetched destinations count:', destinations.value.length);
    console.log('Destinations fetched:', destinations.value);

    // Debug: Fetch total row count
    const { count, error: countError } = await supabase
      .from('destinations')
      .select('id', { count: 'exact', head: true });
    console.log('Total destinations count:', count, 'Count error:', countError);
    if (countError) console.warn('Failed to fetch total count:', countError.message);

    if (destinations.value.length === 0) {
      errorMessage.value = 'No destinations found in the database.';
    } else if (count && destinations.value.length < count) {
      errorMessage.value = `Only ${destinations.value.length} of ${count} destinations fetched. Check RLS policies or authentication.`;
    }
    initializeStatuses(destinations.value);
  } catch (error) {
    console.error('Error fetching destinations:', error.message);
    errorMessage.value = `Failed to load destinations: ${error.message}`;
    if (error.message.includes('permission denied')) {
      errorMessage.value += ` (RLS restriction: Ensure user is authenticated and RLS policies allow access. Check VITE_SUPABASE_ANON_KEY.)`;
    }
  } finally {
    loading.value = false;
    console.log('Loading state:', loading.value);
  }
};

// Computed property to filter destinations and add status
const filteredDestinations = computed(() => {
  const result = destinations.value.map(item => ({
    ...item,
    status: destinationStatuses.value[item.id] || 'Active',
  }));
  if (!searchQuery.value) {
    console.log('No search query, returning all destinations:', result.length, 'Page:', page.value, 'Items per page:', itemsPerPage.value);
    return result;
  }
  const query = searchQuery.value.toLowerCase();
  const filtered = result.filter(destination => destination.name.toLowerCase().includes(query));
  console.log('Filtered destinations count:', filtered.length);
  return filtered;
});

const openEditDialog = (destination) => {
  if (userRole.value !== 'Admin') {
    errorMessage.value = 'Only admins can edit destinations';
    return;
  }
  editingDestination.value = destination;
  editedName.value = destination.name;
  editError.value = '';
  editDialog.value = true;
};

const saveEdit = async () => {
  if (userRole.value !== 'Admin') {
    errorMessage.value = 'Only admins can edit destinations';
    return;
  }
  if (!editedName.value.trim()) {
    editError.value = 'Destination name cannot be empty';
    return;
  }
  console.log('Saving edit for destination:', editingDestination.value.id);
  try {
    const { error } = await supabase
      .from('destinations')
      .update({ name: editedName.value.trim() })
      .eq('id', editingDestination.value.id);
    console.log('Update response:', { error });
    if (error) throw new Error(`Supabase update error: ${error.message}`);
    await fetchDestinations((await supabase.auth.getUser()).data.user.id); // Refresh table
    editDialog.value = false;
  } catch (error) {
    console.error('Error updating destination:', error.message);
    editError.value = `Failed to update destination: ${error.message}`;
  }
};

onMounted(async () => {
  console.log('destinationsView.vue mounted');
  searchQuery.value = ''; // Ensure no initial filtering
  try {
    const authenticated = await isAuthenticated();
    console.log('Authenticated:', authenticated);
    if (!authenticated) {
      console.warn('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    console.log('Authenticated user ID:', userId);
    if (!userId) {
      errorMessage.value = 'No authenticated user found. Please log in again.';
      router.push('/login');
      return;
    }
    await fetchDestinations(userId);
  } catch (error) {
    console.error('Error in onMounted:', error.message);
    errorMessage.value = 'Failed to initialize destinations page: ' + error.message;
  }
});

onUnmounted(() => {
  console.log('destinationsView.vue unmounted');
});
</script>

<template>
  <v-app>
    <!-- Loading Overlay -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular indeterminate color="green" size="64" />
    </v-overlay>

    <!-- Main Content -->
    <v-main class="bg-dashboard">
      <v-container>
        <v-row>
          <v-col cols="12">
            <v-card elevation="4" class="pa-4 card-style">
              <v-card-title class="d-flex align-center title-style">
                <v-icon left color="white">mdi-map-marker</v-icon>
                CCIS Destinations
                <v-spacer />
                <v-btn
                  class="button-activate mr-2"
                  variant="tonal"
                  elevation="2"
                  @click="activateAll"
                  title="Activate all destinations"
                  :disabled="userRole !== 'Admin'"
                >
                  Activate All
                </v-btn>
                <v-btn
                  class="button-deactivate mr-2"
                  variant="tonal"
                  elevation="2"
                  @click="deactivateAll"
                  title="Deactivate all destinations"
                  :disabled="userRole !== 'Admin'"
                >
                  Deactivate All
                </v-btn>
                <v-btn class="button-style" to="/">Back to Dashboard</v-btn>
              </v-card-title>
              <v-card-text>
                <!-- Search Bar -->
                <v-text-field
                  v-model="searchQuery"
                  label="Search Destinations"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  clearable
                  class="mb-4 search-style"
                ></v-text-field>

                <!-- Error Message -->
                <v-alert
                  v-if="errorMessage"
                  type="error"
                  density="compact"
                  class="mb-4 alert-style"
                >
                  {{ errorMessage }}
                </v-alert>

                <!-- Destinations Table -->
                <v-data-table
                  :items="filteredDestinations"
                  :headers="headers"
                  :loading="loading"
                  class="elevation-1 table-style"
                  sticky
                  :page.sync="page"
                  :items-per-page="itemsPerPage"
                  :items-per-page-options="itemsPerPageOptions"
                  :disable-sort="false"
                >
                  <template v-slot:no-data>
                    <v-alert type="info" class="alert-style">
                      {{ searchQuery ? 'No destinations match your search.' : 'No destinations available.' }}
                    </v-alert>
                  </template>
                  <template v-slot:item.name="{ item }">
                    <span>{{ item.name }}</span>
                  </template>
                  <template v-slot:item.edit="{ item }">
                    <v-icon
                      color="green"
                      size="small"
                      @click="openEditDialog(item)"
                      title="Edit Destination Name"
                      class="icon-style"
                      :disabled="userRole !== 'Admin'"
                    >
                      mdi-pencil
                    </v-icon>
                  </template>
                  <template v-slot:item.status="{ item }">
                    <div class="status-cell">
                      <v-chip
                        :color="item.status === 'Active' ? 'active-chip' : 'inactive-chip'"
                        text-color="white"
                        size="small"
                        class="mr-2 chip-style"
                      >
                        {{ item.status }}
                      </v-chip>
                      <v-switch
                        :model-value="item.status === 'Active'"
                        v-bind:class="[item.status === 'Active' ? 'active-switch' : 'inactive-switch']"
                        @update:model-value="toggleStatus(item.id)"
                        hide-details
                        color="transparent"
                        :disabled="userRole !== 'Admin'"
                      ></v-switch>
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card class="dialog-style">
        <v-card-title class="title-style">Edit Destination</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedName"
            label="Destination Name"
            variant="outlined"
            :error-messages="editError"
            class="search-style"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="editDialog = false" class="button-cancel">Cancel</v-btn>
          <v-btn class="button-style" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
/* [Keep existing styles unchanged as they are not affected by the schema change] */
.bg-dashboard {
  background: linear-gradient(135deg, #F5F6F5 0%, #E8F5E9 100%);
}

/* [Rest of the styles remain the same] */
</style>
