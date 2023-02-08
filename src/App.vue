<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router"
import Menu from "./components/Menu.vue"
</script>

<template>
  <Menu></Menu>
  <div style="margin-left:10%;margin-right:10%;"><RouterView /></div>
</template>

<style scoped>

</style>