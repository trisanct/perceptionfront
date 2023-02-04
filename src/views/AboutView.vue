<template>
  <div class="about">
    <h1>This is a test page</h1>
    <el-button @click="hello">测试服务器是否连通</el-button>
    <h2>{{}}</h2>
		
		
  </div>
</template>
<script setup lang="ts">
  import axios from 'axios'
  import { ref } from 'vue';
	const msg=ref('')
  const hello=()=>{
    axios.get(`/server/Hello`,  { data:{
			a:'2'
		}

		}).then((res)=>{
			msg.value=res.data
    })
  }
  function formatDate(s: string) {
    return `${s.slice(0,4)}年${s.slice(5,7)}月${s.slice(8,10)} ${s.slice(11,19)}`
  }
</script>