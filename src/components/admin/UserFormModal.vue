<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit User' : 'Add New User' }}
        </h2>
        <BaseButton 
          @click="$emit('cancel')" 
          variant="icon" 
          size="sm"
          :icon="XIcon"
          class="text-gray-400 hover:text-gray-600"
        />
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Name Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.name }"
            placeholder="Enter full name"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.email }"
            placeholder="Enter email address"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <!-- Password Field (only for new users) -->
        <div v-if="!isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Enter password"
            />
            <BaseButton
              variant="icon"
              size="sm" 
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              :icon="showPassword ? EyeOffIcon : EyeIcon"
            />
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password Field (only for new users) -->
        <div v-if="!isEditing">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.confirmPassword }"
            placeholder="Confirm password"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Role Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            v-model="form.role"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.role }"
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="viewer">Viewer</option>
          </select>
          <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4">
          <BaseButton
            variant="outline"
            size="sm"
            @click="$emit('cancel')"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? 'Update User' : 'Create User' }}
            </span>
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-vue-next'
import { ref, watch, computed } from 'vue'
import BaseButton from '../ui/BaseButton.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// State
const showPassword = ref(false)
const isSubmitting = ref(false)

// Form data
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  status: 'active',
  phone: '',
  department: '',
  notes: ''
})

// Form errors
const errors = ref({})

// Computed
const isEditing = computed(() => !!props.user)

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    status: 'active',
    phone: '',
    department: '',
    notes: ''
  }
  errors.value = {}
  showPassword.value = false
}

// Watch for user prop changes (for editing)
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      password: '',
      confirmPassword: '',
      role: newUser.role || '',
      status: newUser.status || 'active',
      phone: newUser.phone || '',
      department: newUser.department || '',
      notes: newUser.notes || ''
    }
  } else {
    resetForm()
  }
  errors.value = {}
}, { immediate: true })

// Watch for show prop changes
watch(() => props.show, (isVisible) => {
  if (!isVisible) {
    errors.value = {}
  }
})

// Methods
const validateForm = () => {
  errors.value = {}
  
  // Name validation
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'Name must be at least 2 characters'
  }
  
  // Email validation
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  // Password validation (only for new users)
  if (!isEditing.value) {
    if (!form.value.password) {
      errors.value.password = 'Password is required'
    } else if (form.value.password.length < 6) {
      errors.value.password = 'Password must be at least 6 characters'
    }
    
    if (!form.value.confirmPassword) {
      errors.value.confirmPassword = 'Please confirm your password'
    } else if (form.value.password !== form.value.confirmPassword) {
      errors.value.confirmPassword = 'Passwords do not match'
    }
  }
  
  // Role validation
  if (!form.value.role) {
    errors.value.role = 'Role is required'
  }
  
  // Status validation
  if (!form.value.status) {
    errors.value.status = 'Status is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData = {
      ...form.value,
      id: isEditing.value ? props.user.id : Date.now(),
      lastActive: isEditing.value ? props.user.lastActive : 'Just now'
    }
    
    // Remove password fields from the data sent to parent
    delete userData.confirmPassword
    if (isEditing.value) {
      delete userData.password
    }
    
    emit('confirm', userData)
    
    if (!isEditing.value) {
      resetForm()
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>