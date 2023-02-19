<template>
  <el-menu :default-active="$route.path" mode="horizontal" router>
      <el-menu-item style="width:8%;font-size: 18px;min-width: 140px;" index="/">农业病虫害检测</el-menu-item>
      <div class="flex-grow"></div>
      <el-menu-item style="width:5%;font-size: 15px;min-width: 70px;" index="/Create">新建数据集</el-menu-item>
      <el-menu-item style="width:5%;font-size: 15px;min-width: 70px;" index="/Submit">提交检测</el-menu-item>
      <el-menu-item style="width:5%;font-size: 15px;min-width: 70px;" index="/Record">检测记录</el-menu-item>
      <el-menu-item style="width:4%;font-size: 15px;min-width: 40px;margin-right: 8%;" index="/Test">Test</el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
</script>
<style>
.flex-grow {
  flex-grow: 1;
}</style>