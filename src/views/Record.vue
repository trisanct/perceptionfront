<template>
  <h1>检测记录详情 #{{ $route.params.id }}</h1>
  <div v-if="loading" v-loading.fullscreen="true"></div>
  <el-result v-if="error" icon="error" title="服务器离线" sub-title="请稍后再试"></el-result>
  <el-result v-if="state==='Waiting'" title="请稍后" sub-title="正在检测中"></el-result>
  <el-result icon="error" v-if="state==='Error'" title="出错了" sub-title="请联系管理员"></el-result>
  <PredictModeRecord v-if="mode==='Predict'" :record="record"></PredictModeRecord>
  <DirectoryModeRecord v-if="mode==='Directory'" :record="record"></DirectoryModeRecord>
  <VideoModeRecord v-if="mode==='Video'" :record="record"></VideoModeRecord>

</template>
<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted, provide } from 'vue'
import { useRouter } from 'vue-router'
import PredictModeRecord from '@/components/PredictModeRecord.vue'
import DirectoryModeRecord from '@/components/DirectoryModeRecord.vue'
import VideoModeRecord from '@/components/VideoModeRecord.vue'
const router = useRouter()
const id = router.currentRoute.value.params.id
const mode = ref('')
const state = ref('')
let record: any
const loading = ref(true)
const error = ref(false)
const gethistory = async () => {
return (await axios.get(`/server/Record/${id}`)).data
}
onMounted(async () => {
  try{
    let res = await gethistory()
    console.log(res)
    mode.value = res.mode
    state.value = res.state
    record=res
  }catch{
    error.value=true
  }finally{
    loading.value=false
  }
})
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
  display: block;
}
</style>
