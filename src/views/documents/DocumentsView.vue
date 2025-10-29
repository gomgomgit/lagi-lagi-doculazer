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

import { useProjects } from '@/composables/useProjects'
const { uploadProjectKnowledge, fetchProjectKnowledges, deleteProjectKnowledgeById, downloadProjectKnowledgeById } = useProjects()


// State untuk project selection
const selectedProject = ref(null)
const currentView = ref('project-list') // 'project-list' | 'document-management'

// Sample projects data with conversations
const projects = ref([])

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
    uploadQueue.value[index].progress = 0
    
    const formData = new FormData()
    formData.append('file', item.file)
    
    // Simulate progress during upload
    const progressInterval = setInterval(() => {
      if (uploadQueue.value[index].progress < 90) {
        uploadQueue.value[index].progress += 10
      }
    }, 100)
    
    // Call the upload function and wait for response
    const result = await uploadProjectKnowledge(selectedProject.value.id, formData)
    
    // Clear progress interval
    clearInterval(progressInterval)
    uploadQueue.value[index].progress = 100
    
    if (result && result.success) {
      // Create document object from response or file data
      const newDocument = {
        id: result.data?.id || Date.now(),
        name: result.data?.name || item.file.name,
        company: selectedProject.value?.name || 'Unknown',
        uploadDate: result.data?.uploadDate || new Date().toISOString().split('T')[0],
        size: result.data?.size || item.file.size,
        type: result.data?.type || item.file.name.split('.').pop().toLowerCase(),
        projectId: selectedProject.value?.id || null,
        url: result.data?.url || URL.createObjectURL(item.file)
      }
      
      // Add the new document to the list
      documents.value.unshift(newDocument)
      uploadQueue.value[index].status = 'completed'
      console.log(`File ${item.file.name} uploaded successfully`)
      
      // Auto refresh documents list after successful upload to sync with server
      await refreshDocuments()
      
      // Remove completed item from upload queue after 2 seconds
      setTimeout(() => {
        const completedIndex = uploadQueue.value.findIndex((item, idx) => 
          idx === index && item.status === 'completed'
        )
        if (completedIndex !== -1) {
          uploadQueue.value.splice(completedIndex, 1)
        }
      }, 2000)
    } else {
      uploadQueue.value[index].status = 'error'
      uploadQueue.value[index].error = result?.error || 'Upload failed'
      console.error('Upload failed:', result?.error)
    }
    
  } catch (error) {
    uploadQueue.value[index].status = 'error'
    uploadQueue.value[index].error = error.message
    console.error('Upload failed:', error)
  }
}

// Document management methods
const refreshDocuments = async () => {
  if (!selectedProject.value) {
    console.warn('No project selected for document refresh')
    return
  }
  
  try {
    console.log('Refreshing documents for project:', selectedProject.value.id)
    
    // Fetch updated documents from API
    await fetchProjectKnowledges(selectedProject.value.id)
    
    // For now, we'll add a simple simulation of refreshing
    // In a real implementation, you would:
    // 1. Call an API to get documents for the project
    // 2. Update the documents array with fresh data
    
    // Simulate adding the uploaded document to the current documents
    // This ensures the UI shows the new document
    const currentProjectDocs = documents.value.filter(doc => doc.projectId === selectedProject.value.id)
    console.log(`Found ${currentProjectDocs.length} documents for project ${selectedProject.value.id}`)
    
    console.log('Documents refreshed successfully')
  } catch (error) {
    console.error('Error refreshing documents:', error)
  }
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
const downloadDocument = async (document) => {
  try {
    if (!selectedProject.value) {
      console.error('No project selected for document download')
      return
    }

    console.log(`Downloading document: ${document.file_name} from project ${selectedProject.value.id}`)
    
    // Call API to download document
    const result = await downloadProjectKnowledgeById(selectedProject.value.id, document.knowledge_source_id || document.id)

    if (result) {
      // Create blob URL and trigger download
      const blob = result.blob
      const filename = document.file_name
      
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = filename
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`Download completed for: ${filename}`)
    } else {
      console.error('Failed to download document:', result?.error)
      // Fallback to original method if API fails
      if (document.url) {
        const link = window.document.createElement('a')
        link.href = document.url
        link.download = document.file_name || document.name
        link.click()
        console.log(`Fallback download for: ${document.file_name || document.name}`)
      }
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    // Fallback to original method if there's an error
    if (document.url) {
      const link = window.document.createElement('a')
      link.href = document.url
      link.download = document.file_name || document.name
      link.click()
      console.log(`Fallback download for: ${document.file_name || document.name}`)
    }
  }
}

// Delete methods
const confirmDelete = (document) => {
  console.log('Confirm delete for document:', document)
  documentToDelete.value = document
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  documentToDelete.value = null
}

const deleteDocument = async () => {
  try {
    if (!documentToDelete.value || !selectedProject.value) {
      console.error('No document or project selected for deletion')
      return
    }

    console.log(`Deleting document ${documentToDelete.value.file_name} from project ${selectedProject.value.id}`)
    
    // Call API to delete document
    const result = await deleteProjectKnowledgeById(selectedProject.value.id, documentToDelete.value.knowledge_source_id)
    
    if (result && result.success) {
      
      // Refresh documents to sync with server
      await refreshDocuments()
    } else {
      console.error('Failed to delete document:', result?.error)
      // You might want to show an error message to the user here
    }
    
    showDeleteModal.value = false
    documentToDelete.value = null
  } catch (error) {
    console.error('Error deleting document:', error)
    // You might want to show an error message to the user here
    showDeleteModal.value = false
    documentToDelete.value = null
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
