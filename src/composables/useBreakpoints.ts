// composables/useBreakpoints.js
import { ref, onMounted, onUnmounted, computed } from 'vue'

export function useBreakpoints() {
  const width = ref(window.innerWidth)

  const updateWidth = () => {
    width.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  // Брейкпоинты (настройте под свои нужды)
  const isMobile = computed(() => width.value < 768)
  const isTablet = computed(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed(() => width.value >= 1024)

  return { width, isMobile, isTablet, isDesktop }
}