<template>
  <el-result v-if="record?.state==='Waiting'" title="请稍后" sub-title="正在检测中">
  </el-result>
  <el-descriptions class="margin-top" :column="3" :size="'default'" border>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">检测模式</div>
      </template>
      {{ record?.mode }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">当前状态</div>
      </template>
      {{ record?.state }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">提交时间</div>
      </template>
      {{ record?.time }}
    </el-descriptions-item>
    <div v-if="record?.mode === 'Predict'">
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">文件名</div>
        </template>
        {{ record?.filename }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">类别</div>
        </template>
        {{ record?.class }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <div class="cell-item">概率</div>
        </template>
        {{ record?.score }}
      </el-descriptions-item>
    </div>
  </el-descriptions>
  <el-row v-if="record?.mode==='Predict'&&record?.state==='Completed'" style="margin-bottom: 10px">
      <el-col :span="11">
        <h3>输入</h3>
          <el-image :src="`/static${record?.inUrl}`" class="image" fit="contain" />
      </el-col>
      <el-col :span="11" :offset="2">
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
