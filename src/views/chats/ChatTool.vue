<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue';
import { EyeIcon } from 'lucide-vue-next';

</script>

<template>
  <!-- Additional Sidebar (Tools) -->
  <aside class="w-80 base-card bg-card flex flex-col justify-between">
    <!-- Tools Header -->
    <div>
      <div class="border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Settings</h3>
          <button class="p-1 hover:bg-gray-100 rounded">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex gap-4 mt-3 text-sm">
          <button class="text-gray-900 border-b-2 border-blue-500 pb-1">Files</button>
        </div>
      </div>
      <div>
        <div class="py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-800 text-sm">MoM-Notes-10/12/2024.pdf</h4>
            <p class="text-xs text-gray-500 mt-1">10/12/2024</p>
          </div>
          <div>
            <EyeIcon class="w-6 h-6 text-gray-500 mt-2" />
          </div>
        </div>
        <div class="py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-800 text-sm">MoM-Notes-10/12/2024.pdf</h4>
            <p class="text-xs text-gray-500 mt-1">10/12/2024</p>
          </div>
          <div>
            <EyeIcon class="w-6 h-6 text-gray-500 mt-2" />
          </div>
        </div>
        <div class="py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-800 text-sm">MoM-Notes-10/12/2024.pdf</h4>
            <p class="text-xs text-gray-500 mt-1">10/12/2024</p>
          </div>
          <div>
            <EyeIcon class="w-6 h-6 text-gray-500 mt-2" />
          </div>
        </div>
      </div>
    </div>
    <div>
      <BaseButton fullWidth>
        Filter
      </BaseButton>
    </div>
  </aside>
</template>