<template>
  <div class="flex justify-center h-full p-8">
    <!-- Chat Input -->
    <div class="w-full max-w-4xl self-end">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
        💡 Tip: select a feature, it will make you goal easily to achieve
      </div>
      
      <div class="relative">
        <input 
          type="text" 
          placeholder="Write your message ..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <button class="p-1 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
            </svg>
          </button>
          <button class="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Home page component logic
</script>