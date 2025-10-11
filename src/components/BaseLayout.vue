<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800">My Workspace</h1>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2">
        <div class="space-y-1">
          <router-link 
            to="/" 
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <span>Chat With AI</span>
          </router-link>
          
          <div class="text-xs text-gray-500 px-3 py-2">Documents</div>
          <div class="text-xs text-gray-500 px-3 py-2">Shared With Me</div>
          <div class="text-xs text-gray-500 px-3 py-2">Templates</div>
          <div class="text-xs text-gray-500 px-3 py-2">History</div>
        </div>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-gray-200">
        <div class="text-xs text-gray-500">Premium Plan</div>
        <div class="text-sm text-blue-600 mt-1">Upgrade to Premium →</div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex">
      <!-- Content -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">Chat With AI</h2>
              <p class="text-sm text-gray-600">Break down lengthy texts into concise summaries to grasp.</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </header>

        <!-- Router View Content -->
        <div class="flex-1 overflow-auto">
          <router-view />
        </div>
      </div>

      <!-- Additional Sidebar (Tools) -->
      <aside class="w-80 bg-white border-l border-gray-200 flex flex-col">
        <!-- Tools Header -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-800">Tools</h3>
            <button class="p-1 hover:bg-gray-100 rounded">
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex gap-4 mt-3 text-sm">
            <button class="text-gray-900 border-b-2 border-blue-500 pb-1">Tools</button>
            <button class="text-gray-500 pb-1">Files</button>
          </div>
        </div>

        <!-- Tools Content -->
        <div class="flex-1 p-4 space-y-6 overflow-auto">
          <!-- Basic Tools Section -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Tools</h4>
            <div class="space-y-3">
              <div class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div class="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm text-gray-900">Python Runner</div>
                  <div class="text-xs text-gray-600 mt-1">Execute Python scripts directly for quick calculations or automation.</div>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <div class="w-4 h-4 bg-green-500 rounded"></div>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm text-gray-900">Calculator</div>
                  <div class="text-xs text-gray-600 mt-1">Perform simple to complex mathematical operations effortlessly.</div>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div class="w-4 h-4 bg-purple-500 rounded"></div>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-sm text-gray-900">Web Search</div>
                  <div class="text-xs text-gray-600 mt-1">Find information online with instant AI-powered search capabilities.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
// Layout component logic can be added here if needed
</script>