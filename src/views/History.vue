<template>
  <h1>检测记录详情 #{{$route.params.id}}</h1>
  <el-row v-for="(r, i) in row" style="margin-bottom: 10px;">
    <el-col
      v-for="(c, i) in 4"
      :span="5"
      :offset="i > 0 ? 1 : 0"
    >
      <el-card :body-style="{ padding: '0px' }">
        <img :src="results[i].url" class="image" fit="contain" />
        <div style="padding: 14px">
          <div>{{results[i].filename}}</div>
          <div>{{c}} {{i}}</div>
          <div class="bottom">
            {{results[i].rate}}
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
onMounted(() => {
  
})
interface result{
  filename:string,
  url:string,
  disease:string,
  rate:number
}
const results = ref<result[]>([])
results.value.push({filename:'1.png',url:'/input/1.png',disease:'sick', rate:0.6})
results.value.push({filename:'2.bmp',url:'/input/2.bmp',disease:'sick', rate:0.6})
results.value.push({filename:'3.bmp',url:'/input/3.bmp',disease:'sick', rate:0.6})
results.value.push({filename:'4.bmp',url:'/input/4.bmp',disease:'sick', rate:0.6})
results.value.push({filename:'2.bmp',url:'/input/2.bmp',disease:'sick', rate:0.6})
results.value.push({filename:'3.bmp',url:'/input/3.bmp',disease:'sick', rate:0.6})
results.value.push({filename:'4.bmp',url:'/input/4.bmp',disease:'sick', rate:0.6})
results.value.push({filename:'1.png',url:'/input/1.png',disease:'sick', rate:0.6})
const row = ref(2)
</script>
<style scoped>
.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image {
  width: 100%;
  display: block;
}</style>