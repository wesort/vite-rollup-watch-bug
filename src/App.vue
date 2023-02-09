<script setup>
import Logo from '@/components/Logo.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <div class="p-2">
      <Logo />
    </div>

    <RouterView />
  </div>
</template>