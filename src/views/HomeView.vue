<template>
  <div class="flex flex-col items-center justify-center h-full p-8">
    <!-- Welcome Section -->
    <div class="text-center mb-12">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
        <div class="w-8 h-8 bg-white rounded-full"></div>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Odyssey AI</h1>
      <p class="text-gray-600">Get Started By Script A Task And Chat Can Do The Rest.</p>
      <p class="text-gray-500 text-sm mt-1">Not Sure Where To Start?</p>
    </div>
    
    <!-- Feature Cards -->
    <div class="grid grid-cols-3 gap-6 max-w-4xl w-full mb-8">
      <!-- Write Copy -->
      <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Write Copy</h3>
        <p class="text-sm text-gray-600">Create compelling text for ads, emails, and more.</p>
      </div>
      
      <!-- Image Generation -->
      <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Image Generation</h3>
        <p class="text-sm text-gray-600">Design custom visuals with AI.</p>
      </div>
      
      <!-- Research -->
      <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Research</h3>
        <p class="text-sm text-gray-600">Quickly gather and summarize info.</p>
      </div>
      
      <!-- Generate Article -->
      <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Generate Article</h3>
        <p class="text-sm text-gray-600">Write articles on any topic instantly.</p>
      </div>
      
      <!-- Data Analytics -->
      <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Data Analytics</h3>
        <p class="text-sm text-gray-600">Analyze data with AI-driven insights.</p>
      </div>
      
      <!-- Generate Code -->
      <div class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900 mb-2">Generate Code</h3>
        <p class="text-sm text-gray-600">Produce accurate code fast.</p>
      </div>
    </div>
    
    <!-- Chat Input -->
    <div class="w-full max-w-4xl">
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