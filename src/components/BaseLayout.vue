<template>
  <div class="flex h-screen bg-base gap-4 p-4">
    <!-- Sidebar -->
    <aside class="w-80 base-card bg-card text-base flex flex-col">
      <!-- Sidebar Header -->
      <div class="p-4 pt-0 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800">My Workspace</h1>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 space-y-2 mt-2">
        <!-- Project Accordion List -->
        <ProjectAccordion
          v-for="project in projects"
          :key="project.id"
          :project="project"
          :selected-conversation-id="selectedConversationId"
          :expanded-by-default="project.id === selectedProjectId"
          @conversation-selected="onConversationSelected"
          @add-conversation="onAddConversation"
        />
        
        <!-- Empty state -->
        <div v-if="projects.length === 0" class="text-center py-8 text-gray-500">
          <p class="text-sm">No projects available</p>
        </div>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-gray-200">
        <router-link 
          :to="isOnChatPage ? '/documents' : '/'"
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FolderArchiveIcon v-if="isOnChatPage" class="w-4 h-4" />
          <MessageCircleIcon v-else class="w-4 h-4" />
          <span>{{ isOnChatPage ? 'Documents' : 'Back to Chat' }}</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col gap-4">
      <!-- Header -->
      <header class="px-4 pb-0 pt-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ currentHeader }}</h2>
            <p class="text-sm text-gray-600">{{ currentSubtitle }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </header>
      <!-- Router View Content -->
      <div class="base-card bg-card flex flex-1 grow h-full overflow-scroll">
        <router-view />
      </div>
    </div>

    <router-view name="toolbar" />
  </div>
</template>

<script setup>
import { ChevronDownIcon, ChevronRightIcon, CircleChevronDownIcon, FolderArchiveIcon, MessageCircleIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectAccordion from '@/components/ui/ProjectAccordion.vue'

const route = useRoute()
const router = useRouter()

// State for navigation
const selectedProjectId = ref(null)
const selectedConversationId = ref(null)

// Sample projects data with conversations
const projects = ref([
  {
    id: 1,
    name: 'Project Wahiiid',
    conversations: [
      {
        id: 1,
        title: 'Summarize this document..',
        messageCount: 5,
        lastMessage: '2024-10-13',
        projectId: 1
      },
      {
        id: 2,
        title: 'Analyze financial report',
        messageCount: 3,
        lastMessage: '2024-10-12',
        projectId: 1
      },
      {
        id: 3,
        title: 'Review contract terms',
        messageCount: 8,
        lastMessage: '2024-10-11',
        projectId: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Project Tsanii',
    conversations: [
      {
        id: 4,
        title: 'Legal document analysis',
        messageCount: 12,
        lastMessage: '2024-10-13',
        projectId: 2
      },
      {
        id: 5,
        title: 'Risk assessment review',
        messageCount: 7,
        lastMessage: '2024-10-10',
        projectId: 2
      },
      {
        id: 6,
        title: 'Compliance checklist',
        messageCount: 4,
        lastMessage: '2024-10-09',
        projectId: 2
      }
    ]
  }
])

// Event handlers
const onConversationSelected = (conversation) => {
  selectedConversationId.value = conversation.id
  selectedProjectId.value = conversation.projectId
  
  // Navigate to chat view with conversation
  router.push({
    name: 'chat-conversation',
    params: {
      projectId: conversation.projectId,
      conversationId: conversation.id
    }
  })
}

const onAddConversation = (project) => {
  selectedProjectId.value = project.id
  
  // Navigate to new chat for the project
  router.push({
    name: 'chat-conversation',
    params: {
      projectId: project.id,
      conversationId: 'new'
    }
  })
}

// Computed properties untuk mendapatkan header dan subtitle dari route meta
const currentHeader = computed(() => {
  return route.meta?.header || 'Default Header'
})

const currentSubtitle = computed(() => {
  return route.meta?.subtitle || 'Default subtitle for this page.'
})

// Computed property untuk mendeteksi apakah sedang di halaman chat
const isOnChatPage = computed(() => {
  return route.name === 'chat' || route.name === 'chat-conversation'
})
</script>