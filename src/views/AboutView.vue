<template>
  <div class="about">
    <h1>This is a test page</h1>
    <el-button @click="getweathers">获取天气情况</el-button>
    <br/>
    <li v-for="{date, temperatureC, summary} in weathers.list">
      <ul>{{formatDate(date)}}</ul>
      <ul>{{temperatureC}}</ul>
      <ul>{{summary}}</ul>
    </li>
		
  </div>
</template>
<script setup lang="ts">
  import axios from "axios"
  import { reactive } from "vue";
  const weathers=reactive({
    list:[]
  })
  const getweathers=()=>{
    axios.get(`/server/GetWeather`).then((res)=>{
      console.log(res.data)
      weathers.list=res.data
    })
  }
  function formatDate(s: string) {
    return `${s.slice(0,4)}年${s.slice(5,7)}月${s.slice(8,10)} ${s.slice(11,19)}`
  }
</script>