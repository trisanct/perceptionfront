<template>
  <el-descriptions size="large" :column="2" border>
    <el-descriptions-item>
      <template #label>
        <div style="font-size: 18px">数据集</div>
      </template>
      {{ record?.dataset }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div style="font-size: 18px">提交时间</div>
      </template>
      {{ record?.time }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div style="font-size: 18px">检测模式</div>
      </template>
      {{ record?.mode }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div style="font-size: 18px">文件名</div>
      </template>
      {{ record?.filename }}
    </el-descriptions-item>
  </el-descriptions>
  <h3>结果</h3>
  <el-table :data="record?.results" border>
    <template #empty>未检出</template>
    <el-table-column prop="id" label="编号" />
    <el-table-column prop="class" label="类别" />
    <el-table-column prop="score" label="置信度" />
  </el-table>
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
defineProps({
  record: {
    type: Object,
    default: undefined,
  },
})
</script>
