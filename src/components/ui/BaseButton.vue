<template>
  <button 
    :class="buttonClasses" 
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <!-- Icon (jika ada) -->
    <component 
      v-if="icon" 
      :is="icon" 
      :size="iconSize"
    />
    
    <!-- Slot untuk konten button -->
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // Tipe button: 'primary', 'secondary', 'outline', 'ghost', 'danger', 'icon'
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger', 'icon'].includes(value)
  },
  // Ukuran button: 'sm', 'md', 'lg'
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  // Text button (jika tidak menggunakan slot)
  text: {
    type: String,
    default: ''
  },
  // Icon component dari lucide-vue-next
  icon: {
    type: Object,
    default: null
  },
  // Ukuran icon
  iconSize: {
    type: [String, Number],
    default: 22
  },
  // Disabled state
  disabled: {
    type: Boolean,
    default: false
  },
  // Full width button
  fullWidth: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits(['click'])

// Computed classes
const buttonClasses = computed(() => {
  const gapClass = props.variant === 'icon' ? 'gap-0' : 'gap-3'
  const baseClasses = `${props.variant !== 'icon' ? 'base-button' : ''} flex items-center ${gapClass} transition-colors`
  
  // Variant classes
  const variantClasses = {
    primary: 'btn-action',
    secondary: 'btn-action-secondary',
    outline: 'border-2 border-orange text-orange bg-transparent hover:bg-orange hover:text-white focus:ring-orange',
    ghost: 'text-orange hover:bg-orange/10 focus:ring-orange',
    danger: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 focus:ring-red-500',
    icon: ''
  }
  
  // Size classes
  const sizeClasses = {
    sm: props.variant === 'icon' ? 'p-1' : 'px-3 py-1.5 text-sm',
    md: props.variant === 'icon' ? 'p-1.5' : 'px-4 py-2 text-base',
    lg: props.variant === 'icon' ? 'p-2' : 'px-6 py-3 text-lg'
  }
  
  // Additional classes
  const additionalClasses = []
  
  if (props.fullWidth) {
    additionalClasses.push('w-full justify-center')
  }
  
  if (props.disabled) {
    additionalClasses.push('opacity-50 cursor-not-allowed')
  }
  
  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    ...additionalClasses
  ].join(' ')
})
</script>