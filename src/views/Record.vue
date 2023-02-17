<template>
  <h1>检测记录详情 #{{ $route.params.id }}</h1>
  <el-empty v-if="loading" v-loading="true" style="width:100%;height:100%" description="加载中"></el-empty>
  <el-result v-if="state==='Waiting'" title="请稍后" sub-title="正在检测中"></el-result>
  <el-result icon="error" v-if="state==='Error'" title="出错了" sub-title="请联系管理员"></el-result>
  <PredictModeRecord v-if="mode==='Predict'" :record="record"></PredictModeRecord>

    <!-- <div v-if="mode === 'Directory'">
      <el-row v-for="(r, i) in row" style="margin-bottom: 10px">
      <el-col v-for="(c, j) in 4" :span="5" :offset="j > 0 ? 1 : 0">
        <el-card v-if="i * 4 + j < results.length" :body-style="{ padding: '0px' }">
          <img :src="results[i * 4 + j].url" class="image" fit="contain" />
          <div style="padding: 14px">
            <div>{{ results[i * 4 + j].filename }}</div>
            <div>{{ i }} {{ j }}</div>
            <div class="bottom">
              {{ results[i * 4 + j].rate }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    </div>-->
</template>
<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PredictModeRecord from '@/components/PredictModeRecord.vue';
const router = useRouter()
// interface recordofpredictmode {
//   id: number
//   mode: string
//   state: string
//   time: string
//   filename: string
//   class: string
//   score: number
//   inUrl: string
//   outUrl: string
// }
// interface result {
//   id: number
//   filename: string
//   class: string
//   score: number
//   inUrl: string
//   outUrl: string
// }
// const record = ref<record>()
// const row = ref(2)
// const mode = ref('predict')
const id = router.currentRoute.value.params.id
const mode = ref('')
const state = ref('')
let record:any
//const record = ref( )
const loading = ref(true)
const gethistory = async () => {
  return (await axios.get(`/server/History/${id}`)).data
}
onMounted(async () => {
  let res = await gethistory()
  console.log(res)
  loading.value=false
  mode.value = res.mode
  state.value = res.state
  record=res.record
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
