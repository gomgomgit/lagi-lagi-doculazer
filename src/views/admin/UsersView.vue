<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
        <p class="text-gray-600">Manage system users and their permissions</p>
      </div>
      <BaseButton @click="showAddUserModal">
        <PlusIcon class="w-4 h-4" />
        Add User
      </BaseButton>
    </div>

    <!-- Search and Filter Bar -->
    <div class="flex gap-4 items-center">
      <div class="flex-1 relative">
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users by name or email..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <select 
        v-model="filterRole"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
        <option value="viewer">Viewer</option>
      </select>
    </div>

    <!-- Users Table -->
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon class="w-5 h-5 text-gray-600" />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getRoleColor(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
              <BaseButton 
                @click="editUser(user)"
                variant="icon"
                size="sm"
                :icon="EditIcon"
                class="text-blue-600 hover:text-blue-900"
                title="Edit User"
              />
              <BaseButton 
                @click="deleteUser(user)"
                variant="icon"
                size="sm"
                :icon="TrashIcon"
                class="text-red-600 hover:text-red-900"
                title="Delete User"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-500">
        Showing {{ filteredUsers.length }} of {{ users.length }} users
      </div>
      <div class="flex gap-2">
        <BaseButton 
          variant="secondary" 
          size="sm"
        >
          Previous
        </BaseButton>
        <BaseButton 
          variant="secondary" 
          size="sm"
        >
          Next
        </BaseButton>
      </div>
    </div>

    <!-- User Form Modal -->
    <UserFormModal
      :show="showModal"
      :user="selectedUser"
      @confirm="handleUserSubmit"
      @cancel="cancelUserForm"
    />
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import UserFormModal from '@/components/admin/UserFormModal.vue'
import { EditIcon, PlusIcon, SearchIcon, TrashIcon, UserIcon } from 'lucide-vue-next'
import { ref, computed } from 'vue'

// State
const searchQuery = ref('')
const filterRole = ref('')
const showModal = ref(false)
const selectedUser = ref(null)

// Sample users data
const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user'
  },
  {
    id: 3,
    name: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    role: 'user'
  },
  {
    id: 4,
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'user'
  }
])

// Computed properties
const filteredUsers = computed(() => {
  let result = users.value

  if (searchQuery.value) {
    result = result.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filterRole.value) {
    result = result.filter(user => user.role === filterRole.value)
  }

  return result
})

// Methods
const getRoleColor = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800'
    case 'user':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Modal methods
const showAddUserModal = () => {
  selectedUser.value = null
  showModal.value = true
}

const editUser = (user) => {
  selectedUser.value = { ...user }
  showModal.value = true
}

const deleteUser = (user) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      console.log('User deleted:', user.name)
    }
  }
}

const handleUserSubmit = (userData) => {
  if (selectedUser.value) {
    // Edit existing user
    const index = users.value.findIndex(u => u.id === userData.id)
    if (index > -1) {
      users.value[index] = userData
      console.log('User updated:', userData.name)
    }
  } else {
    // Add new user
    users.value.push(userData)
    console.log('User added:', userData.name)
  }
  
  showModal.value = false
  selectedUser.value = null
}

const cancelUserForm = () => {
  showModal.value = false
  selectedUser.value = null
}
</script>