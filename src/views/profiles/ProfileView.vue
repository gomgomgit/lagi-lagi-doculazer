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
            : Admin
          </div>
          <div class="mb-2 text-md">
            : admin@example.com
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-8">
        <button @click="showChangePassword" class="base-button btn-action-secondary mt-4 flex items-center gap-3">
          <SaveIcon size="22" /> Change Password
        </button>
        <button @click="showEditProfile" class="base-button btn-action mt-4 flex items-center gap-3">
          <SaveIcon size="22" /> Edit Profile
        </button>
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
          <input class="border border-gray-300 rounded-full p-2 px-4 w-full" type="text" name="full-name" id="full-name" value="Admin">
        </div>
      </div>
      <div>
        <div class="mt-4 mb-2 text-md">
          Email
        </div>
        <div>
          <input class="border border-gray-300 rounded-full p-2 px-4 w-full" type="email" name="email" id="email" value="admin@example.com">
        </div>
      </div>
      <div class="flex justify-between">
        <button @click="showProfile" class="base-button btn-action-secondary mt-4 flex items-center gap-3">
          <CircleArrowLeftIcon size="22" /> Back
        </button>
        <button class="base-button btn-action mt-4 flex items-center gap-3">
          <SaveIcon size="22" /> Save Changes
        </button>
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
        <button @click="showProfile" class="base-button btn-action-secondary mt-4 flex items-center gap-3">
          <CircleArrowLeftIcon size="22" /> Back
        </button>
        <button class="base-button btn-action mt-4 flex items-center gap-3">
          <SaveIcon size="22" /> Change Password
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CircleArrowLeftIcon, SaveIcon } from 'lucide-vue-next';
import CardHeader from '@/components/ui/CardHeader.vue'

// State untuk mengontrol tampilan mana yang aktif
const currentView = ref('profile') // 'profile', 'edit-profile', 'change-password'

// Functions untuk mengubah tampilan
const showProfile = () => {
  currentView.value = 'profile'
}

const showEditProfile = () => {
  currentView.value = 'edit-profile'
}

const showChangePassword = () => {
  currentView.value = 'change-password'
}
</script>