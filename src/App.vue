<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router"
import Menu from "./components/Menu.vue"
</script>

<template>
  <Menu></Menu>
  <el-row>
    <el-col :xs="0" :md="1" :lg="2"></el-col>
    <el-col :xs="24" :md="22" :lg="20"><RouterView></RouterView></el-col>
    <el-col :xs="0" :md="1" :lg="2"></el-col>
  </el-row>
</template>

<style scoped>

</style>