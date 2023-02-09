<template>
  <h1>检测记录</h1>
  <el-table v-loading="loading" :data="loading?nullvalue:records" style="width: 100%">
    <el-table-column prop="id" label="编号" width="180" />
    <el-table-column prop="mode" label="检测模式" width="180" />
    <el-table-column prop="time" label="提交时间" width="180" />
    <el-table-column prop="result" label="结果" />
  </el-table>
  <el-pagination layout="prev, pager, next" v-model:current-page="id" :total="count" />
</template>
<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
const count = ref(0)
const id = ref(1)
const loading = ref(true)
watch(id, async (newid, oldid) => {
  loading.value = true
  const res = await getpage(
    newid > oldid,
    newid > oldid ? records.value[records.value.length - 1].id : records.value[0].id,
    Math.abs(newid - oldid) - 1
  )
  records.value = res
  loading.value = false
})
interface record {
  id: number
  mode: string
  time: string
  result: string
}
const records = ref<record[]>([])
const nullvalue = [
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
  { id: 0, mode: '', time: '', result: '' },
]
const getpage = async (direction: boolean, lastid: number, step: number) => {
  return (await axios.get(`/server/History/${direction}/${lastid}/${step}`)).data
}
onMounted(async () => {
  let res = await getpage(true, 0, 0)
  records.value = res.recordlist
  count.value = res.count as number
  loading.value = false
})
</script>

<style>
.el-pagination {
  justify-content: center;
}
</style>
