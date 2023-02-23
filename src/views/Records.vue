<template>
  <h1>检测记录</h1>
  <el-result v-if="error" icon="error" title="服务器离线" sub-title="请稍后再试"></el-result>
  <div v-if="!error">
    <el-table v-loading="loading" :data="loading ? nullvalue : records" style="width: 100%" @row-click="onRowClick">
      <el-table-column prop="id" label="编号" />
      <el-table-column prop="dataset" label="数据集" />
      <el-table-column prop="mode" label="检测模式" />
      <el-table-column prop="state" label="当前状态" />
      <el-table-column prop="time" label="提交时间" />
      <!-- <el-table-column prop="result" label="结果" /> -->
    </el-table>
    <el-pagination layout="prev, pager, next" v-model:current-page="id" :total="count" />
  </div>
</template>
<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const count = ref(0)
const id = ref(1)
const loading = ref(true)
const error = ref(false)
watch(id, async (newid, oldid) => {
  loading.value = true
  const res = await getpage(
    newid > oldid,
    newid > oldid ? records.value[records.value.length - 1].id : records.value[0].id,
    Math.abs(newid - oldid) - 1
  )
  records.value = res.recordlist
  count.value = res.count as number
  loading.value = false
})
interface record {
  id: number
  dataset: string
  mode: string
  state: string
  time: string
}
const records = ref<record[]>([])
const nullvalue = [
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
  { id: 0, dataset: '', mode: '', state: '', time: '' }, //, result: '' },
]
const getpage = async (direction: boolean, lastid: number, step: number) => {
  return (await axios.get(`/server/Record/${direction}/${lastid}/${step}`)).data
}
const onRowClick = (row: any) => {
  router.push(`/Record/${row.id}`)
}
onMounted(async () => {
  try {
    let res = await getpage(true, 0, 0)
    records.value = res.recordlist
    count.value = res.count as number
    loading.value = false
  } catch {
    error.value = true
  }
})
</script>

<style scoped>
.el-pagination {
  justify-content: center;
}
</style>
