<template>
  <div v-if="show" class="admin-modal-overlay fixed inset-0 flex items-center justify-center z-50">
    <div class="admin-modal rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- Modal Header -->
      <div class="admin-header flex items-center justify-between p-6">
        <h2 class="text-xl font-semibold admin-title">
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
          <label class="admin-form-label block text-sm font-medium mb-2">
            Full Name *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="admin-form-input w-full px-3 py-2 rounded-lg"
            :class="{ 'error': errors.name }"
            placeholder="Enter full name"
          />
          <p v-if="errors.name" class="admin-form-error-text mt-1 text-sm">{{ errors.name }}</p>
        </div>

        <!-- Email Field -->
        <div>
          <label class="admin-form-label block text-sm font-medium mb-2">
            Email Address *
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="admin-form-input w-full px-3 py-2 rounded-lg"
            :class="{ 'error': errors.email }"
            placeholder="Enter email address"
          />
          <p v-if="errors.email" class="admin-form-error-text mt-1 text-sm">{{ errors.email }}</p>
        </div>

        <!-- Password Field (only for new users) -->
        <!-- <div v-if="!isEditing">
          <label class="admin-form-label block text-sm font-medium mb-2">
            Password *
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="admin-form-input w-full px-3 py-2 pr-10 rounded-lg"
              :class="{ 'error': errors.password }"
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
          <p v-if="errors.password" class="admin-form-error-text mt-1 text-sm">{{ errors.password }}</p>
        </div> -->

        <!-- Confirm Password Field (only for new users) -->
        <!-- <div v-if="!isEditing">
          <label class="admin-form-label block text-sm font-medium mb-2">
            Confirm Password *
          </label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="admin-form-input w-full px-3 py-2 rounded-lg"
            :class="{ 'error': errors.confirmPassword }"
            placeholder="Confirm password"
          />
          <p v-if="errors.confirmPassword" class="admin-form-error-text mt-1 text-sm">{{ errors.confirmPassword }}</p>
        </div> -->

        <!-- Role Field -->
        <div>
          <label class="admin-form-label block text-sm font-medium mb-2">
            Role *
          </label>
          <select
            v-model="form.role"
            required
            class="admin-form-input w-full px-3 py-2 rounded-lg"
            :class="{ 'error': errors.role }"
          >
            <option value="">Select role</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>
          <p v-if="errors.role" class="admin-form-error-text mt-1 text-sm">{{ errors.role }}</p>
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
      role: newUser.role || '',
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
  
  // Role validation
  if (!form.value.role) {
    errors.value.role = 'Role is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  console.log('Handling form submission')
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData = {
      ...form.value,
      user_id: isEditing.value ? props.user.user_id : 0,
    }
    
    console.log('Submitting user data:', userData)
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