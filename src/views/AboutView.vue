<template>
  <div class="about">
    <h1>This is a test page</h1>
    <el-button @click="hello">测试服务器是否连通</el-button>
    <h2>{{msg}}</h2>
    
    
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
</script>