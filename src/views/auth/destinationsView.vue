<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isAuthenticated } from '@/utils/supabase';

const router = useRouter();
const loading = ref(true);
const destinations = ref([]);
const errorMessage = ref('');
const searchQuery = ref('');
const userRole = ref('');

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

// Static status mapping
const statusMapping = {
  'Auditorium': 'Active',
  'CCIS OFFICE': 'Active',
  'Exit': 'Active',
  'CL1': 'Active',
  'CL2': 'Active',
  'Cr': 'Inactive',
  'Fablab': 'Inactive',
  '2nd floor CR 1': 'Inactive',
  // Add more destinations as needed
};

// Reactive status tracking
const destinationStatuses = ref({});

// Initialize statuses from mapping
const initializeStatuses = (destinations) => {
  destinations.forEach(dest => {
    destinationStatuses.value[dest.id] = statusMapping[dest.name] || 'Active';
  });
  console.log('Initialized statuses:', destinationStatuses.value);
};

const toggleStatus = (destinationId) => {
  destinationStatuses.value[destinationId] =
    destinationStatuses.value[destinationId] === 'Active' ? 'Inactive' : 'Active';
  console.log('Toggled status for ID:', destinationId, 'to', destinationStatuses.value[destinationId]);
};

const activateAll = () => {
  Object.keys(destinationStatuses.value).forEach(id => {
    destinationStatuses.value[id] = 'Active';
  });
  console.log('Activated all destinations');
};

const deactivateAll = () => {
  Object.keys(destinationStatuses.value).forEach(id => {
    destinationStatuses.value[id] = 'Inactive';
  });
  console.log('Deactivated all destinations');
};

const headers = [
  { title: 'Destination', key: 'name', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Edit', key: 'edit', sortable: false },
  { title: 'Availability', key: 'status', sortable: true },
];

const fetchDestinations = async (userId) => {
  console.log('Fetching all destinations from Supabase for user:', userId);
  try {
    loading.value = true;

    // Fetch user role from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    console.log('Profile fetch response:', { profileData, profileError });
    if (profileError) throw new Error(`Failed to fetch user role: ${profileError.message}`);
    userRole.value = profileData?.role || 'Unknown';
    console.log('User role:', userRole.value);

    // Fetch all destinations
    const { data, error } = await supabase
      .from('destinations')
      .select('id, name, description')
      .order('name', { ascending: true });
    console.log('Destinations fetch response:', { data, error });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    destinations.value = data || [];
    console.log('Fetched destinations count:', destinations.value.length);
    console.log('Destinations fetched:', destinations.value);

    // Debug: Fetch total row count (requires admin access or RLS bypass)
    const { count, error: countError } = await supabase
      .from('destinations')
      .select('id', { count: 'exact', head: true });
    console.log('Total destinations count:', count, 'Count error:', countError);
    if (countError) console.warn('Failed to fetch total count:', countError.message);

    if (destinations.value.length === 0) {
      errorMessage.value = 'No destinations found in the database.';
    } else if (count && destinations.value.length < count) {
      errorMessage.value = `Only ${destinations.value.length} of ${count} destinations fetched. Check RLS policies or user role.`;
    }
    initializeStatuses(destinations.value);
  } catch (error) {
    console.error('Error fetching destinations:', error.message);
    errorMessage.value = `Failed to load destinations: ${error.message}`;
    if (error.message.includes('permission denied')) {
      errorMessage.value += ` (RLS restriction: User role is "${userRole.value}". Ensure role is "Admin" in profiles table. Run: SELECT id, role FROM profiles WHERE id = '${userId}';`;
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
  editingDestination.value = destination;
  editedName.value = destination.name;
  editError.value = '';
  editDialog.value = true;
};

const saveEdit = async () => {
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
                >
                  Activate All
                </v-btn>
                <v-btn
                  class="button-deactivate mr-2"
                  variant="tonal"
                  elevation="2"
                  @click="deactivateAll"
                  title="Deactivate all destinations"
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
                  <template v-slot:item.description="{ item }">
                    {{ item.description || 'No description available' }}
                  </template>
                  <template v-slot:item.edit="{ item }">
                    <v-icon
                      color="green"
                      size="small"
                      @click="openEditDialog(item)"
                      title="Edit Destination Name"
                      class="icon-style"
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
/* Base theme */
.bg-dashboard {
  background: linear-gradient(135deg, #F5F6F5 0%, #E8F5E9 100%);
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

/* Search bar */
.search-style {
  background: #FFFFFF;
  border-radius: 8px;
}
.search-style :deep(.v-field) {
  border: 1px solid #C8E6C9;
}
.search-style :deep(.v-field--focused) {
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Shadow for sticky headers */
}
.table-style :deep(.v-data-table__th) {
  color: #4A4A4A !important;
  font-weight: 600 !important;
}
.table-style :deep(.v-data-table__tr:nth-child(even)) {
  background: #FFFFFF;
}
.table-style :deep(.v-data-table__tr:hover) {
  background: #E8F5E9 !important; /* Hover effect */
}
.table-style :deep(.v-data-table-footer) {
  background: #E8F5E9;
  border-top: 1px solid #C8E6C9;
}

/* Chips */
.chip-style {
  transition: all 0.3s ease;
}
:deep(.v-chip--variant-tonal.active-chip) {
  background: linear-gradient(90deg, #4CAF50 0%, #81C784 100%);
}
:deep(.v-chip--variant-tonal.inactive-chip) {
  background: linear-gradient(90deg, #EF5350 0%, #F06292 100%);
}

/* Switch */
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

/* Icons */
.icon-style {
  transition: transform 0.2s ease;
}
.icon-style:hover {
  transform: scale(1.2);
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
.button-activate {
  background: linear-gradient(90deg, #388E3C 0%, #4CAF50 100%);
  color: #FFFFFF !important;
  border: 1px solid #2E7D32;
  border-radius: 8px;
  text-transform: none;
  padding: 8px 16px;
  transition: all 0.3s ease;
}
.button-activate:hover {
  box-shadow: 0 0 12px rgba(56, 142, 60, 0.7);
  transform: scale(1.05);
}
.button-deactivate {
  background: linear-gradient(90deg, #EF5350 0%, #F06292 100%);
  color: #FFFFFF !important;
  border: 1px solid #D32F2F;
  border-radius: 8px;
  text-transform: none;
  padding: 8px 16px;
  transition: all 0.3s ease;
}
.button-deactivate:hover {
  box-shadow: 0 0 12px rgba(239, 83, 80, 0.5);
  transform: scale(1.05);
}
.button-cancel {
  color: #4A4A4A !important;
  text-transform: none;
}

/* Alert */
.alert-style {
  border-radius: 8px;
}

/* Dialog */
.dialog-style {
  border-radius: 12px;
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #C8E6C9;
}

/* Status cell */
.status-cell {
  display: flex;
  align-items: center;
}
</style>
