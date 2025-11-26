<template>
  <div class="min-h-screen bg-base flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Login Card -->
      <div class="base-card bg-card">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-orange to-orange-700 rounded-full mx-auto mb-6 flex items-center justify-center">
            <div class="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h1 class="text-2xl font-bold text-navy mb-2">Welcome Back</h1>
          <p class="text-dark-400">Sign in to your account to continue</p>
        </div>

        <!-- Login Form -->
        <form @submit="handleLogin" class="space-y-6">
          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ errorMessage }}
          </div>

          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-navy-700 mb-2">
              Email Address
            </label>
            <input 
              v-model="formData.email"
              type="email" 
              id="email" 
              name="email"
              class="w-full px-4 py-3 border border-light-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter your email"
              required
            >
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-navy-700 mb-2">
              Password
            </label>
            <input 
              v-model="formData.password"
              type="password" 
              id="password" 
              name="password"
              class="w-full px-4 py-3 border border-light-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter your password"
              required
            >
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                v-model="formData.remember"
                type="checkbox" 
                id="remember" 
                name="remember"
                class="w-4 h-4 text-blue-500 border-light-gray-300 rounded focus:ring-blue-500"
              >
              <label for="remember" class="ml-2 text-sm text-dark-600">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-blue-500 hover:text-blue-700 transition-colors">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <button 
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full btn-action base-button font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="authStore.isLoading">Signing In...</span>
            <span v-else>Sign In</span>
          </button>

          <!-- Test Login Button (Development Only) -->
          <!-- <button 
            type="button"
            @click="handleTestLogin"
            :disabled="authStore.isLoading"
            class="w-full btn-action-secondary base-button font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2 disabled:opacity-50 mt-2"
          >
            <span v-if="authStore.isLoading">Testing...</span>
            <span v-else>🧪 Test Login (Dev)</span>
          </button> -->
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form data (dengan default test credentials)
const formData = ref({
  email: 'user@doculazer.com',
  password: '123123',
  remember: false
})

const errorMessage = ref('')

// Handle form submission
const handleLogin = async (event) => {
  event.preventDefault()
  errorMessage.value = ''

  if (!formData.value.email || !formData.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  const result = await authStore.login({
    email: formData.value.email,
    password: formData.value.password
  })

  if (result.success) {
    // Redirect to dashboard after successful login
    router.push('/')
  } else {
    errorMessage.value = result.error || 'Login failed. Please try again.'
  }
}

// Handle test login
const handleTestLogin = async () => {
  errorMessage.value = ''
  
  const result = await authStore.testLogin()
  
  if (result.success) {
    router.push('/')
  } else {
    errorMessage.value = `Test login failed: ${result.error}`
  }
}
</script>