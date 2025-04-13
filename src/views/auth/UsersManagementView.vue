<template>
  <v-container class="pa-4">
    <v-card class="elevation-2">
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <span class="text-h6 font-weight-bold">User Management</span>
          <v-btn color="primary" @click="showAddDialog = true">
            <v-icon left>mdi-account-plus</v-icon>
            Add User
          </v-btn>
        </div>
      </v-card-title>

      <!-- Search Bar -->
      <v-text-field
        v-model="search"
        append-inner-icon="mdi-magnify"
        label="Search users"
        class="mx-4"
        hide-details
        single-line
        variant="outlined"
      />

      <!-- User Table -->
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:item.actions="{ item }">
          <!-- Action Buttons -->
          <v-btn icon @click="viewUser(item)">
            <v-icon color="primary">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon @click="confirmDelete(item)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
          <v-btn icon @click="blockUser(item)">
            <v-icon color="yellow">mdi-block-helper</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add User Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title>Add New User</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field label="Full Name" v-model="newUser.name" />
            <v-text-field label="Email" v-model="newUser.email" />
            <v-text-field label="CCIS ID No." v-model="newUser.idNo" />
            <v-select
              :items="['Admin', 'User']"
              label="Role"
              v-model="newUser.role"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="addUser">Save</v-btn>
          <v-btn text @click="showAddDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ selectedUser?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="red" @click="deleteUser">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref(null)

const newUser = ref({
  name: '',
  email: '',
  idNo: '',
  role: ''
})

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'ID No.', value: 'idNo' },
  { title: 'Email', value: 'email' },
  { title: 'Role', value: 'role' },
  { title: 'Actions', value: 'actions', sortable: false }
]

const users = ref([
  { name: 'John Lester Curro', email: 'john@gmail.com', idNo: '201-10658', role: 'Admin' },
  { name: 'Maria Lopez', email: 'maria@yahoo.com', idNo: '201-10659', role: 'User' },
  { name: 'Jake Wilson', email: 'jake@outlook.com', idNo: '201-10660', role: 'User' },
  { name: 'Samantha Reed', email: 'samantha@gmail.com', idNo: '201-10661', role: 'Admin' },
  { name: 'David Miller', email: 'david@hotmail.com', idNo: '201-10662', role: 'User' },
  { name: 'Sophia Johnson', email: 'sophia@yahoo.com', idNo: '201-10663', role: 'Admin' },
  { name: 'Lucas Smith', email: 'lucas@icloud.com', idNo: '201-10664', role: 'User' },
  { name: 'Olivia Davis', email: 'olivia@outlook.com', idNo: '201-10665', role: 'User' },
  { name: 'James Brown', email: 'james@gmail.com', idNo: '201-10666', role: 'Admin' },
  { name: 'Lily Clark', email: 'lily@yahoo.com', idNo: '201-10667', role: 'User' }
])

const filteredUsers = computed(() =>
  users.value.filter(user =>
    Object.values(user).some(val =>
      val.toString().toLowerCase().includes(search.value.toLowerCase())
    )
  )
)

function addUser() {
  if (newUser.value.name && newUser.value.email && newUser.value.idNo && newUser.value.role) {
    users.value.push({ ...newUser.value })
    newUser.value = { name: '', email: '', idNo: '', role: '' }
    showAddDialog.value = false
  }
}

function confirmDelete(user) {
  selectedUser.value = user
  showDeleteDialog.value = true
}

function deleteUser() {
  users.value = users.value.filter(u => u !== selectedUser.value)
  showDeleteDialog.value = false
  selectedUser.value = null
}

function viewUser(user) {
  alert(`User: ${user.name} (${user.role}) - ${user.email}`)
}

function blockUser(user) {
  alert(`Blocked user: ${user.name}`)
}
</script>

<style scoped>
.v-data-table {
  margin-top: 16px;
}
</style>
