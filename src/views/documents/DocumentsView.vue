<template>
  <div class="w-full base-card bg-card flex-1 grow h-full overflow-scroll">
    <!-- Project List View -->
    <ProjectList
      ref="projectListRef"
      v-if="currentView === 'project-list'"
      @project-selected="selectProject"
      @add-project="addNewProject"
    />

    <!-- Document Management View -->
    <DocumentManager
      ref="documentManagerRef"
      v-else-if="currentView === 'document-management' && selectedProject"
      :selected-project="selectedProject"
      :upload-queue="uploadQueue"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      @back-to-projects="backToProjects"
      @files-selected="onFilesSelected"
      @file-error="onFileError"
      @upload-file="uploadFile"
      @upload-all-files="uploadAllFiles"
      @cancel-upload-all="cancelUploadAll"
      @remove-from-queue="removeFromQueue"
      @refresh-documents="refreshDocuments"
      @view-pdf="handleViewPDF"
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ProjectList from '@/components/documents/ProjectList.vue'
import DocumentManager from '@/components/documents/DocumentManager.vue'
import PDFViewer from '@/components/documents/PDFViewer.vue'
import DeleteConfirmModal from '@/components/documents/DeleteConfirmModal.vue'

import { useProjects } from '@/composables/useProjects'
import { usePDFViewer } from '@/composables/usePDFViewer'

const { uploadProjectKnowledge, fetchProjectKnowledges, deleteProjectKnowledgeById, addProject, downloadProjectKnowledgeById } = useProjects()

// Use PDF Viewer composable
const { showPDFViewer, selectedDocument, viewPDF, closePDFViewer } = usePDFViewer()

// State untuk project selection
const selectedProject = ref(null)
const currentView = ref('project-list') // 'project-list' | 'document-management'

// State untuk file upload
const uploadQueue = ref([])

// State untuk modals
const showDeleteModal = ref(false)
const documentToDelete = ref(null)

// Sorting state
const sortField = ref('uploadDate')
const sortDirection = ref('desc')

// Ref untuk ProjectList component
const projectListRef = ref(null)

// Ref untuk DocumentManager component  
const documentManagerRef = ref(null)

// State untuk upload all functionality
const isUploadingAll = ref(false)
const uploadAllCancelled = ref(false)

// Project navigation methods
const selectProject = (project) => {
  selectedProject.value = project
  currentView.value = 'document-management'
}

const backToProjects = () => {
  // Prevent navigation if upload all is in progress
  if (isUploadingAll.value) return
  
  selectedProject.value = null
  currentView.value = 'project-list'
  uploadQueue.value = []
}

const addNewProject = async (projectData) => {
  try {
    const newProject = await addProject(projectData)
    
    if (newProject && projectListRef.value && projectListRef.value.fetchProjects) {
      await projectListRef.value.fetchProjects()
    }
  } catch (error) {
    console.error('Error creating project:', error)
  }
}

// File upload handlers
const onFilesSelected = (files) => {
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
    
    if (result) {
      uploadQueue.value[index].status = 'completed'
      
      await refreshDocuments()
      
      const completedIndex = uploadQueue.value.findIndex((item, idx) => 
        idx === index && item.status === 'completed'
      )
      if (completedIndex !== -1) {
        uploadQueue.value.splice(completedIndex, 1)
      }
    } else {
      uploadQueue.value[index].status = 'error'
      uploadQueue.value[index].error = result?.error || 'Upload failed'
    }
    
  } catch (error) {
    uploadQueue.value[index].status = 'error'
    uploadQueue.value[index].error = error.message
    console.error('Upload failed:', error)
  }
}

const uploadingAllFile = async (item, index) => {
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
    
    if (result) {
      uploadQueue.value[index].status = 'completed'
      
      await refreshDocuments()
      
      // Auto-remove handled by upload all completion
    } else {
      uploadQueue.value[index].status = 'error'
      uploadQueue.value[index].error = result?.error || 'Upload failed'
    }
    
  } catch (error) {
    uploadQueue.value[index].status = 'error'
    uploadQueue.value[index].error = error.message
    console.error('Upload failed:', error)
  }
}

const removeFromQueue = (index) => {
  uploadQueue.value.splice(index, 1)
}

const uploadAllFiles = async () => {
  if (uploadQueue.value.length === 0) return

  isUploadingAll.value = true
  uploadAllCancelled.value = false
  
  // Create a snapshot of pending files to avoid array mutation issues
  const pendingFiles = uploadQueue.value
    .map((item, index) => ({ item: { ...item }, originalIndex: index }))
    .filter(({ item }) => item.status === 'pending')

  for (let i = 0; i < pendingFiles.length; i++) {
    // Check if upload all was cancelled
    if (uploadAllCancelled.value) break

    const { item, originalIndex } = pendingFiles[i]
    
    // Find current index in queue (since array might have changed)
    const currentIndex = uploadQueue.value.findIndex(queueItem => 
      queueItem.file.name === item.file.name && queueItem.file.size === item.file.size
    )
    
    if (currentIndex === -1) {
      continue
    }
    
    if (documentManagerRef.value) {
      documentManagerRef.value.updateUploadAllProgress(currentIndex)
    }
    
    try {
      await uploadingAllFile(item, currentIndex)
      
      // Small delay between uploads
      if (i < pendingFiles.length - 1 && !uploadAllCancelled.value) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`Failed to upload ${item.file.name}:`, error)
    }
  }

  // Complete upload all
  isUploadingAll.value = false
  if (documentManagerRef.value) {
    documentManagerRef.value.completeUploadAll()
  }
  
  const completedCount = uploadQueue.value.filter(item => item.status === 'completed').length
  
  // Auto-remove completed items after upload all (only if not cancelled)
  if (!uploadAllCancelled.value && completedCount > 0) {
    setTimeout(() => {
      uploadQueue.value = uploadQueue.value.filter(item => item.status !== 'completed')
    }, 3000)
  }
}

const cancelUploadAll = () => {
  uploadAllCancelled.value = true
  isUploadingAll.value = false
  
  if (documentManagerRef.value) {
    documentManagerRef.value.completeUploadAll()
  }
}

// Document management methods
const refreshDocuments = async () => {
  if (!selectedProject.value) return
  
  try {
    // Refresh documents in the DocumentManager component if available
    if (documentManagerRef.value && documentManagerRef.value.refreshDocuments) {
      await documentManagerRef.value.refreshDocuments()
    } else {
      // Fallback to direct API call
      await fetchProjectKnowledges(selectedProject.value.id)
    }
    
    // Force UI update
    await nextTick()
  } catch (error) {
    console.error('Error refreshing documents:', error)
  }
}

// PDF Viewer methods - now using composable, just need wrapper for selectedProject
const handleViewPDF = async (document) => {
  if (!selectedProject.value) return
  
  await viewPDF(document, selectedProject.value.id)
}

// Download method
const downloadDocument = async (document) => {
  try {
    if (!selectedProject.value) return

    const result = await downloadProjectKnowledgeById(selectedProject.value.id, document.knowledge_source_id || document.id)

    if (result) {
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
    } else if (document.url) {
      // Fallback to original method if API fails
      const link = window.document.createElement('a')
      link.href = document.url
      link.download = document.file_name || document.name
      link.click()
    }
  } catch (error) {
    console.error('Error downloading document:', error)
    // Fallback to original method if there's an error
    if (document.url) {
      const link = window.document.createElement('a')
      link.href = document.url
      link.download = document.file_name || document.name
      link.click()
    }
  }
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
    if (!documentToDelete.value || !selectedProject.value) return

    const result = await deleteProjectKnowledgeById(selectedProject.value.id, documentToDelete.value.knowledge_source_id)
    
    if (result && result.success) {
      await refreshDocuments()
    }
    
    showDeleteModal.value = false
    documentToDelete.value = null
  } catch (error) {
    console.error('Error deleting document:', error)
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
    if (isUploadingAll.value) {
      cancelUploadAll()
    } else if (showPDFViewer.value) {
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
