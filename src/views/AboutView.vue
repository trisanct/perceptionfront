<template>
  <div class="about">
    <h1>测试页面</h1>
    <h2>若点击按钮后出现Hello字样则与服务器通信正常。</h2>
    <el-button @click="hello">测试服务器是否连通</el-button>
    <h2>{{msg}}</h2>
    <el-button @click="task">测试试验任务队列</el-button>
    <el-button @click="task1">测试正常任务队列</el-button>
    
    
  </div>
</template>
<script setup lang="ts">
  import axios from 'axios'
  import { ref } from 'vue';
  const msg=ref('')
  const hello=()=>{
    axios.get(`/server/Hello`,).then((res)=>{
      msg.value=res.data
    })
  }
  const task=()=>{
    axios.get(`/server/TestTask/1`,)
  }
  const task1=()=>{
    axios.get(`/server/TestHistory/1`,)
  }
</script>