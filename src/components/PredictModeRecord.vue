<template>
  <el-descriptions size="large" :column="3" border>
    <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">检测模式</div>
      </template>
      {{ record?.mode }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">当前状态</div>
      </template>
      {{ record?.state }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div style="font-size:18px">提交时间</div>
      </template>
      {{ record?.time }}
    </el-descriptions-item>
    <div v-if="record?.mode === 'Predict'">
      <el-descriptions-item>
        <template #label>
          <div style="font-size:18px">文件名</div>
        </template>
        {{ record?.filename }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div style="font-size:18px">类别</div>
        </template>
        {{ record?.class }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div style="font-size:18px">概率</div>
        </template>
        {{ record?.score }}
      </el-descriptions-item>
    </div>
  </el-descriptions>
  <el-row style="margin-bottom: 10px">
    <el-col :span="11">
      <h3>输入</h3>
      <el-image :src="`/static${record?.inUrl}`" class="image" fit="contain" />
    </el-col>
    <el-col v-if="record?.state === 'Completed'" :span="11" :offset="2">
      <h3>输出</h3>
      <el-image :src="`/static${record?.outUrl}`" class="image" fit="contain" />
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
interface recordofpredictmode {
  id: number
  mode: string
  state: string
  time: string
  filename: string
  class: string
  score: number
  inUrl: string
  outUrl: string
}
defineProps({
  record: {
    type: Object,
    default: undefined,
  },
})
</script>
