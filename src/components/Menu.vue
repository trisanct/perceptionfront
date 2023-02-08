<template>
  <el-menu :default-active="$route.path" mode="horizontal" router>
			<el-menu-item style="width:10%;font-size: 20px;" index="/none" @click="redirectToHome">农业病虫害检测</el-menu-item>
			<el-menu-item style="width:5%;font-size: 16px;" index="/">主页</el-menu-item>
			<!-- <el-menu-item style="width:40%;" :disabled="true"></el-menu-item> -->
			<el-menu-item style="width:5%;font-size: 16px;margin-left: 60%;" index="/Submit">提交检测</el-menu-item>
			<el-menu-item style="width:5%;font-size: 16px;" index="/History">历史记录</el-menu-item>
			<el-menu-item style="width:5%;font-size: 16px;" index="/Test">Test</el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
const router=useRouter()
const redirectToHome = () => {
	router.push('/')
}
</script>