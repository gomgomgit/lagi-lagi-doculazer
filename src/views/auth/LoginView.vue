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
        <form class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-navy-700 mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              name="email"
              class="w-full px-4 py-3 border border-light-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-colors"
              placeholder="Enter your email"
            >
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-navy-700 mb-2">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              name="password"
              class="w-full px-4 py-3 border border-light-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange outline-none transition-colors"
              placeholder="Enter your password"
            >
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                name="remember"
                class="w-4 h-4 text-orange border-light-gray-300 rounded focus:ring-orange"
              >
              <label for="remember" class="ml-2 text-sm text-dark-600">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-orange hover:text-orange-700 transition-colors">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <button 
            type="submit"
            class="w-full btn-action base-button font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Login page logic akan ditambahkan nanti
</script>