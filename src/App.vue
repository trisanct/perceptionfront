<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router"
import Menu from "./components/Menu.vue"
</script>

<template>
  <div><Menu></Menu></div>
  <div style="margin-top: 10px"><RouterView /></div>
</template>

<style scoped></style>