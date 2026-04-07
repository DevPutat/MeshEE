<script setup lang="ts">
const {
    size = 20
} = defineProps<{
    size?: number
}>()
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :width="size" :height="size" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:1;"><path fill="none"     d="m15 18l-.722-3.25M2 8a10.645 10.645 0 0 0 20 0m-2 7l-1.726-2.05M4 15l1.726-2.05M9 18l.722-3.25"/></svg>
</template>