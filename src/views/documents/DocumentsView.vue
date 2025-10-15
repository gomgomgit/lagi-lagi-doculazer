<template>
  <div class="w-full base-card bg-card flex-1 grow h-full overflow-scroll">
    <!-- Project List View -->
    <ProjectList
      v-if="currentView === 'project-list'"
      :projects="projects"
      :get-document-count="getProjectDocumentCount"
      @project-selected="selectProject"
      @add-project="addNewProject"
    />

    <!-- Document Management View -->
    <DocumentManager
      v-else-if="currentView === 'document-management' && selectedProject"
      :selected-project="selectedProject"
      :documents="documents"
      :upload-queue="uploadQueue"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      @back-to-projects="backToProjects"
      @files-selected="onFilesSelected"
      @file-error="onFileError"
      @upload-file="uploadFile"
      @refresh-documents="refreshDocuments"
      @view-pdf="viewPDF"
      @download-document="downloadDocument"
      @confirm-delete="confirmDelete"
      @sort-by="sortBy"
    />

    <!-- PDF Viewer -->
    <PDFViewer
      :show="showPDFViewer"
      :document="selectedDocument"
      @close="closePDFViewer"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :show="showDeleteModal"
      :document="documentToDelete"
      @confirm="deleteDocument"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ProjectList from '@/components/documents/ProjectList.vue'
import DocumentManager from '@/components/documents/DocumentManager.vue'
import PDFViewer from '@/components/documents/PDFViewer.vue'
import DeleteConfirmModal from '@/components/documents/DeleteConfirmModal.vue'

// State untuk project selection
const selectedProject = ref(null)
const currentView = ref('project-list') // 'project-list' | 'document-management'

// Sample projects data with conversations
const projects = ref([
  {
    id: 1,
    name: 'Project Satu',
    description: 'Analisis laporan keuangan PT ABC',
    documentCount: 5,
    createdDate: '2024-09-15',
    lastUpdated: '2024-10-12',
    conversations: [
      {
        id: 1,
        title: 'Analisis laporan Q3 2024',
        messageCount: 5,
        lastMessage: '2024-10-12',
        projectId: 1
      },
      {
        id: 2,
        title: 'Ringkasan financial statement',
        messageCount: 3,
        lastMessage: '2024-10-11',
        projectId: 1
      },
      {
        id: 3,
        title: 'Review audit findings',
        messageCount: 8,
        lastMessage: '2024-10-10',
        projectId: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Project Dua',
    description: 'Audit internal PT XYZ',
    documentCount: 3,
    createdDate: '2024-09-20',
    lastUpdated: '2024-10-10',
    conversations: [
      {
        id: 4,
        title: 'Analisis risk assessment',
        messageCount: 12,
        lastMessage: '2024-10-10',
        projectId: 2
      },
      {
        id: 5,
        title: 'Review internal controls',
        messageCount: 7,
        lastMessage: '2024-10-09',
        projectId: 2
      }
    ]
  },
  {
    id: 3,
    name: 'Project Tiga',
    description: 'Due diligence CV DEF',
    documentCount: 7,
    createdDate: '2024-10-01',
    lastUpdated: '2024-10-11',
    conversations: [
      {
        id: 6,
        title: 'Due diligence checklist review',
        messageCount: 15,
        lastMessage: '2024-10-11',
        projectId: 3
      },
      {
        id: 7,
        title: 'Legal document analysis',
        messageCount: 9,
        lastMessage: '2024-10-08',
        projectId: 3
      },
      {
        id: 8,
        title: 'Financial projection review',
        messageCount: 6,
        lastMessage: '2024-10-07',
        projectId: 3
      }
    ]
  }
])

// State untuk file upload
const uploadQueue = ref([])

// State untuk modals
const showPDFViewer = ref(false)
const showDeleteModal = ref(false)
const selectedDocument = ref(null)
const documentToDelete = ref(null)

// Sorting state
const sortField = ref('uploadDate')
const sortDirection = ref('desc')

// Sample documents data (replace with actual API call)
const documents = ref([
  {
    id: 1,
    name: 'Annual_Report_2024.pdf',
    company: 'PT ABC',
    uploadDate: '2024-10-01',
    size: 2048576, // 2MB
    type: 'pdf',
    projectId: 1,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 2,
    name: 'Financial_Statement_Q3.pdf',
    company: 'PT XYZ',
    uploadDate: '2024-09-15',
    size: 1536000, // 1.5MB
    type: 'pdf',
    projectId: 1,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 3,
    name: 'Contract_Agreement.docx',
    company: 'CV DEF',
    uploadDate: '2024-10-10',
    size: 512000, // 500KB
    type: 'docx',
    projectId: 2,
    url: '#'
  },
  {
    id: 4,
    name: 'Meeting_Notes.txt',
    company: 'PT ABC',
    uploadDate: '2024-10-12',
    size: 25600, // 25KB
    type: 'txt',
    projectId: 1,
    url: '#'
  },
  {
    id: 5,
    name: 'Budget_Proposal_2025.pdf',
    company: 'PT XYZ',
    uploadDate: '2024-10-05',
    size: 3072000, // 3MB
    type: 'pdf',
    projectId: 2,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 6,
    name: 'Due_Diligence_Report.pdf',
    company: 'CV DEF',
    uploadDate: '2024-10-08',
    size: 4096000, // 4MB
    type: 'pdf',
    projectId: 3,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
])

// Computed untuk document count per project
const getProjectDocumentCount = (projectId) => {
  return documents.value.filter(doc => doc.projectId === projectId).length
}

// Project navigation methods
const selectProject = (project) => {
  selectedProject.value = project
  currentView.value = 'document-management'
  console.log(`Selected project: ${project.name}`)
}

const backToProjects = () => {
  selectedProject.value = null
  currentView.value = 'project-list'
  uploadQueue.value = []
}

const addNewProject = (projectName) => {
  console.log('Add new project:', projectName)
  
  // Generate new project ID
  const newId = Math.max(...projects.value.map(p => p.id), 0) + 1
  
  // Create new project
  const newProject = {
    id: newId,
    name: projectName,
    description: '',
    documentCount: 0,
    createdDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0]
  }
  
  // Add to projects array
  projects.value.push(newProject)
  
  console.log('Project added successfully:', newProject)
}

// File upload handlers
const onFilesSelected = (files) => {
  console.log('Files selected:', files)
  
  const newItems = files.map(file => ({
    file,
    status: 'pending',
    progress: 0,
    error: null
  }))
  
  uploadQueue.value.push(...newItems)
}

const onFileError = (errors) => {
  console.error('File upload errors:', errors)
  errors.forEach(error => {
    console.error(error)
  })
}

const uploadFile = async (item, index) => {
  try {
    uploadQueue.value[index].status = 'uploading'
    
    const formData = new FormData()
    formData.append('file', item.file)
    formData.append('project_id', selectedProject.value?.id)
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      uploadQueue.value[index].progress = progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Simulate adding to documents list
    const newDocument = {
      id: Date.now(),
      name: item.file.name,
      company: selectedProject.value?.name || 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      size: item.file.size,
      type: item.file.name.split('.').pop().toLowerCase(),
      projectId: selectedProject.value?.id || null,
      url: URL.createObjectURL(item.file)
    }
    
    documents.value.unshift(newDocument)
    uploadQueue.value[index].status = 'completed'
    console.log(`File ${item.file.name} uploaded successfully`)
    
  } catch (error) {
    uploadQueue.value[index].status = 'error'
    uploadQueue.value[index].error = error.message
    console.error('Upload failed:', error)
  }
}

// Document management methods
const refreshDocuments = async () => {
  console.log('Refreshing documents...')
}

// PDF Viewer methods
const viewPDF = (document) => {
  selectedDocument.value = document
  showPDFViewer.value = true
}

const closePDFViewer = () => {
  showPDFViewer.value = false
  selectedDocument.value = null
}

// Download method
const downloadDocument = (document) => {
  const link = document.createElement('a')
  link.href = document.url
  link.download = document.name
  link.click()
  console.log(`Downloading: ${document.name}`)
}

// Delete methods
const confirmDelete = (document) => {
  documentToDelete.value = document
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  documentToDelete.value = null
}

const deleteDocument = async () => {
  try {
    const docIndex = documents.value.findIndex(doc => doc.id === documentToDelete.value.id)
    if (docIndex !== -1) {
      documents.value.splice(docIndex, 1)
    }
    
    console.log(`Document ${documentToDelete.value.name} deleted successfully`)
    showDeleteModal.value = false
    documentToDelete.value = null
  } catch (error) {
    console.error('Error deleting document:', error)
  }
}

// Sorting methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Keyboard shortcuts
const handleEscapeKey = (e) => {
  if (e.key === 'Escape') {
    if (showPDFViewer.value) {
      closePDFViewer()
    } else if (showDeleteModal.value) {
      cancelDelete()
    } else if (currentView.value === 'document-management') {
      backToProjects()
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>
