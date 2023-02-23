<template>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h1>数据集管理</h1>
    <el-button type="success" @click="onNewClick">新建数据集</el-button>
  </div>
  <el-result v-if="error" icon="error" title="服务器离线" sub-title="请稍后再试"></el-result>
  <div v-if="!error">
    <el-table v-loading="loading" :data="datasets" style="width: 100%" @row-click="onRowClick">
      <el-table-column prop="id" label="编号" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="epoch" label="迭代轮数" />
      <el-table-column prop="state" label="当前状态" />
    </el-table>
  </div>
</template>
<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const loading = ref(true)
const error = ref(false)
interface dataset {
  id: number
  name: string
  state: string
  epoch: number
}
const datasets = ref<dataset[]>([])
const getdatasets = async () => {
  return (await axios.get(`/server/Dataset`)).data
}
const onRowClick = (row: any) => {
  router.push(`/Record/${row.id}`)
}
const onNewClick = () => {
  router.push('/NewDataset')
}
onMounted(async () => {
  try {
    let res = await getdatasets()
    datasets.value = res
    loading.value = false
  } catch {
    error.value = true
  }
})
</script>
