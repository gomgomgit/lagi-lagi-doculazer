<template>
  <div class="w-full">
    <!-- Data Profile -->
    <div v-if="currentView === 'profile'">
      <CardHeader 
        title="Your Profile" 
        subtitle="View and edit your profile information" 
      />
      <div class="flex gap-6 mb-4">
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
      <div>
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
      <div class="flex justify-between">
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
      <div>
        <div class="mb-2 text-md">
          Old Password
        </div>
        <div>
          <input class="border border-gray-300 rounded-lg p-2 w-full" type="password" name="old-password" id="old-password">
        </div>
      </div>
      <div class="mt-4">
        <div class="mb-2 text-md">
          New Password
        </div>
        <div>
          <input class="border border-gray-300 rounded-lg p-2 w-full" type="password" name="new-password" id="new-password">
        </div>
      </div>
      <div class="mt-4">
        <div class="mb-2 text-md">
          Confirm New Password
        </div>
        <div>
          <input class="border border-gray-300 rounded-lg p-2 w-full" type="password" name="confirm-new-password" id="confirm-new-password">
        </div>
      </div>
      <div class="flex justify-between">
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
        >
          Change Password
        </BaseButton>
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
  return authStore.user?.name || authStore.user?.fullname || authStore.user?.full_name || 'User'
})

const userEmail = computed(() => {
  return authStore.user?.email || 'No email available'
})

// Form data untuk edit profile
const profileForm = ref({
  fullname: '',
  email: ''
})

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
  currentView.value = 'change-password'
}

// Handle save profile changes
// const handleSaveProfile = async () => {
//   try {
//     const result = await authStore.updateProfile({
//       name: profileForm.value.fullname,
//       email: profileForm.value.email
//     })
    
//     if (result.success) {
//       // Show success message or notification
//       console.log('Profile updated successfully')
//       showProfile() // Go back to profile view
//     } else {
//       console.error('Failed to update profile:', result.error)
//     }
//   } catch (error) {
//     console.error('Error updating profile:', error)
//   }
// }
</script>