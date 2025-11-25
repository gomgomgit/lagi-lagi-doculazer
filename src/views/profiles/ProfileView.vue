<template>
  <div class="w-full">
    <div class="base-card bg-card flex-1 grow h-full overflow-scroll">

      <!-- Data Profile -->
      <div v-if="currentView === 'profile'">
        <CardHeader 
          title="Your Profile" 
          subtitle="View and edit your profile information" 
        />
        <div class="flex gap-6 my-4">
          <div class="">
            <div class="mb-2 text-md">
              Fullname
            </div>
            <div class="mb-2 text-md">
              Email
            </div>
          </div>
          <div class="">
            <div class="mb-2 text-md">
              : {{ userFullname }}
            </div>
            <div class="mb-2 text-md">
              : {{ userEmail }}
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-8">
          <BaseButton 
            variant="secondary" 
            :icon="SaveIcon" 
            @click="showChangePassword"
          >
            Change Password
          </BaseButton>
          <BaseButton 
            variant="primary" 
            :icon="SaveIcon" 
            @click="showEditProfile"
          >
            Edit Profile
          </BaseButton>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div v-if="currentView === 'edit-profile'">
        <CardHeader 
          title="Edit Profile" 
          subtitle="update your information" 
        />
        <div class="my-4">
          <div class="mb-2 text-md">
            Fullname
          </div>
          <div>
            <input 
              v-model="profileForm.fullname" 
              class="border border-gray-300 rounded-full p-2 px-4 w-full" 
              type="text" 
              name="full-name" 
              id="full-name" 
              :placeholder="userFullname"
            >
          </div>
        </div>
        <div>
          <div class="mt-4 mb-2 text-md">
            Email
          </div>
          <div>
            <input 
              v-model="profileForm.email" 
              class="border border-gray-300 rounded-full p-2 px-4 w-full" 
              type="email" 
              name="email" 
              id="email" 
              :placeholder="userEmail"
            >
          </div>
        </div>
        <div class="flex justify-between mt-4">
          <BaseButton 
            variant="secondary" 
            :icon="CircleArrowLeftIcon" 
            @click="showProfile"
          >
            Back
          </BaseButton>
          <BaseButton 
            variant="primary" 
            :icon="SaveIcon"
            @click="handleSaveProfile"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading">Saving...</span>
            <span v-else>Save Changes</span>
          </BaseButton>
        </div>
      </div>

      <!-- Change Password Form -->
      <div v-if="currentView === 'change-password'">
        <CardHeader 
          title="Change Password" 
          subtitle="Please enter your current password and the new password" 
        />
        
        <!-- Success Message -->
        <div v-if="passwordSuccess" class="my-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          {{ passwordSuccess }}
        </div>
        
        <!-- Error Message -->
        <div v-if="passwordError" class="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {{ passwordError }}
        </div>
        
        <div class="my-4">
          <div class="mb-2 text-md">
            Old Password
          </div>
          <div>
            <input 
              v-model="passwordForm.oldPassword"
              class="border border-gray-300 rounded-lg p-2 w-full" 
              type="password" 
              name="old-password" 
              id="old-password"
              placeholder="Enter your current password"
            >
          </div>
        </div>
        <div class="mt-4">
          <div class="mb-2 text-md">
            New Password
          </div>
          <div>
            <input 
              v-model="passwordForm.newPassword"
              class="border border-gray-300 rounded-lg p-2 w-full" 
              type="password" 
              name="new-password" 
              id="new-password"
              placeholder="Enter your new password (min. 6 characters)"
            >
          </div>
        </div>
        <div class="mt-4">
          <div class="mb-2 text-md">
            Confirm New Password
          </div>
          <div>
            <input 
              v-model="passwordForm.confirmPassword"
              class="border border-gray-300 rounded-lg p-2 w-full" 
              type="password" 
              name="confirm-new-password" 
              id="confirm-new-password"
              placeholder="Confirm your new password"
            >
          </div>
        </div>
        <div class="flex justify-between mt-4">
          <BaseButton
            variant="secondary"
            :icon="CircleArrowLeftIcon"
            @click="showProfile"
            :disabled="authStore.isLoading"
          >
            Back
          </BaseButton>
          <BaseButton
            variant="primary"
            :icon="SaveIcon"
            @click="handleChangePassword"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading">Changing...</span>
            <span v-else>Change Password</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CircleArrowLeftIcon, SaveIcon } from 'lucide-vue-next';
import CardHeader from '@/components/ui/CardHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

// State untuk mengontrol tampilan mana yang aktif
const authStore = useAuthStore()

console.log('User data:', authStore)

// State untuk mengontrol tampilan mana yang aktif
const currentView = ref('profile') // 'profile', 'edit-profile', 'change-password'

// Computed properties untuk user data
const userFullname = computed(() => {
  return authStore.user?.name || 'User'
})

const userEmail = computed(() => {
  return authStore.user?.email || 'No email available'
})

// Form data untuk edit profile
const profileForm = ref({
  fullname: '',
  email: ''
})

// Form data untuk change password
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Error states
const passwordError = ref('')
const passwordSuccess = ref('')

// Initialize form data when user data is available
const initializeForm = () => {
  profileForm.value.fullname = userFullname.value
  profileForm.value.email = userEmail.value
}

// Functions untuk mengubah tampilan
const showProfile = () => {
  currentView.value = 'profile'
}

const showEditProfile = () => {
  initializeForm() // Initialize form with current user data
  currentView.value = 'edit-profile'
}

const showChangePassword = () => {
  // Reset form data and errors
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordError.value = ''
  passwordSuccess.value = ''
  currentView.value = 'change-password'
}

// Handle save profile changes
const handleSaveProfile = async () => {
  try {
    const result = await authStore.updateProfile({
      name: profileForm.value.fullname,
      email: profileForm.value.email
    })
    
    if (result.success) {
      // Show success message or notification
      console.log('Profile updated successfully')
      showProfile() // Go back to profile view
    } else {
      console.error('Failed to update profile:', result.error)
    }
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}

// Handle password change
const handleChangePassword = async () => {
  // Reset errors
  passwordError.value = ''
  passwordSuccess.value = ''

  // Validate form
  if (!passwordForm.value.oldPassword) {
    passwordError.value = 'Old password is required'
    return
  }

  if (!passwordForm.value.newPassword) {
    passwordError.value = 'New password is required'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'New password must be at least 6 characters long'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New password and confirm password do not match'
    return
  }

  try {
    const result = await authStore.changePassword({
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword,
      confirm_new_password: passwordForm.value.confirmPassword
    })
    
    if (result.success) {
      passwordSuccess.value = 'Password changed successfully!'
      // Reset form
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      console.error('Failed to change password:', result)
      passwordError.value = error.error_detail || 'Failed to change password'
    }
  } catch (error) {
    console.error('Error changing password:', error)
    passwordError.value = 'An error occurred while changing password'
  }
}
</script>